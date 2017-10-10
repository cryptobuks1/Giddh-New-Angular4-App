import { Component, OnInit, Input, OnDestroy, EventEmitter, Output, ViewChild } from '@angular/core';
import { LedgerService } from '../../../services/ledger.service';
import { LedgerResponse } from '../../../models/api-models/Ledger';
import { AppState } from '../../../store/roots';
import { Store } from '@ngrx/store';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Rx';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { IOption } from '../../../shared/theme/index';
import { TaxResponse } from '../../../models/api-models/Company';
import { UploadInput, UploadOutput } from 'ngx-uploader';
import { ToasterService } from '../../../services/toaster.service';
import { LEDGER_API } from '../../../services/apiurls/ledger.api';
import { ModalDirective } from 'ngx-bootstrap';
import { AccountService } from '../../../services/account.service';
import { ITransactionItem, ILedgerTransactionItem } from '../../../models/interfaces/ledger.interface';
import { TransactionVM } from '../../ledger.vm';
import { last, filter, orderBy, reduce, sumBy } from 'lodash';
import { Select2OptionData } from '../../../shared/theme/select2/select2.interface';
import * as uuid from 'uuid';
import { IFlattenAccountsResultItem } from '../../../models/interfaces/flattenAccountsResultItem.interface';
import { LedgerActions } from '../../../services/actions/ledger/ledger.actions';
import { UpdateLedgerVm } from './updateLedger.vm';

@Component({
  selector: 'update-ledger-entry-panel',
  templateUrl: './updateLedgerEntryPanel.component.html',
  styleUrls: ['./updateLedgerEntryPanel.component.css']
})
export class UpdateLedgerEntryPanelComponent implements OnInit, OnDestroy {
  public vm: UpdateLedgerVm;
  @Output() public closeUpdateLedgerModal: EventEmitter<boolean> = new EventEmitter();
  @Output() public entryDeleted: EventEmitter<boolean> = new EventEmitter();
  @ViewChild('deleteAttachedFileModal') public deleteAttachedFileModal: ModalDirective;
  @ViewChild('deleteEntryModal') public deleteEntryModal: ModalDirective;
  public sessionKey$: Observable<string>;
  public companyName$: Observable<string>;
  public accountsOptions: Select2Options = {
    multiple: false,
    width: '100%',
    placeholder: 'Select Accounts',
    allowClear: true,
    templateSelection: (data) => data.text,
    templateResult: (data: any) => {
      if (data.text === 'Searching…') {
        return;
      }
      if (!data.additional.stock) {
        return $(`<a href="javascript:void(0)" class="account-list-item" style="border-bottom: 1px solid #000;">
                        <span class="account-list-item" style="display: block;font-size:14px">${data.text}</span>
                        <span class="account-list-item" style="display: block;font-size:12px">${data.additional.uniqueName}</span>
                      </a>`);
      } else {
        return $(`<a href="javascript:void(0)" class="account-list-item" style="border-bottom: 1px solid #000;">
                        <span class="account-list-item" style="display: block;font-size:14px">${data.text}</span>
                        <span class="account-list-item" style="display: block;font-size:12px">${data.additional.uniqueName}</span>
                        <span class="account-list-item" style="display: block;font-size:11px">
                            Stock: ${data.additional.stock.name}
                        </span>
                      </a>`);
      }
    }
  };
  public isFileUploading: boolean = false;
  public accountUniqueName: string;
  public entryUniqueName$: Observable<string>;
  public companyTaxesList$: Observable<TaxResponse[]>;
  public uploadInput: EventEmitter<UploadInput>;
  public selectedAccount: IFlattenAccountsResultItem = null;
  public isDeleteTrxEntrySuccess$: Observable<boolean>;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  constructor(private store: Store<AppState>, private _ledgerService: LedgerService,
    private route: ActivatedRoute, private _toasty: ToasterService, private _accountService: AccountService,
    private _ledgerAction: LedgerActions) {
    this.vm = new UpdateLedgerVm(this._toasty);
    this.vm.selectedLedger = new LedgerResponse();
    this.entryUniqueName$ = this.store.select(p => p.ledger.selectedTxnForEditUniqueName).takeUntil(this.destroyed$);
    this.companyTaxesList$ = this.store.select(p => p.company.taxes).takeUntil(this.destroyed$);
    this.sessionKey$ = this.store.select(p => p.session.user.session.id).takeUntil(this.destroyed$);
    this.companyName$ = this.store.select(p => p.session.companyUniqueName).takeUntil(this.destroyed$);
    this.isDeleteTrxEntrySuccess$ = this.store.select(p => p.ledger.isDeleteTrxEntrySuccessfull).takeUntil(this.destroyed$);

    // get flatten_accounts list
    this._accountService.GetFlattenAccounts('', '').takeUntil(this.destroyed$).subscribe(data => {
      if (data.status === 'success') {
        let accountsArray: Select2OptionData[] = [];
        this.vm.flatternAccountList = data.body.results;
        data.body.results.map(acc => {
          if (acc.stocks) {
            acc.stocks.map(as => {
              accountsArray.push({
                id: acc.uniqueName,
                text: acc.name,
                additional: Object.assign({}, acc, { stock: as })
              });
            });
            accountsArray.push({ id: acc.uniqueName, text: acc.name, additional: acc });
          } else {
            accountsArray.push({ id: acc.uniqueName, text: acc.name, additional: acc });
          }
        });
        this.vm.flatternAccountList4Select2 = Observable.of(orderBy(accountsArray, 'text'));
      }
    });
  }
  public ngOnInit() {
    // get Account name from url
    this.route.params.takeUntil(this.destroyed$).subscribe(params => {
      this.accountUniqueName = params['accountUniqueName'];
    });

    // emit upload event
    this.uploadInput = new EventEmitter<UploadInput>();

    //  get entry from server
    this.entryUniqueName$.distinctUntilChanged().subscribe(entryName => {
      if (entryName) {
        this._ledgerService.GetLedgerTransactionDetails(this.accountUniqueName, entryName).subscribe(resp => {
          if (resp.status === 'success') {
            this.vm.selectedLedger = resp.body;
            if (this.vm.selectedLedger.total.type === 'DEBIT') {
              this.vm.selectedLedger.transactions.push(this.vm.blankTransactionItem('CREDIT'));
            } else {
              this.vm.selectedLedger.transactions.push(this.vm.blankTransactionItem('DEBIT'));
            }
            this.vm.getEntryTotal();
            this.vm.generateGrandTotal();
            this.vm.getPanelAmount();
          }
        });
      }
    });

    // check if delete entry is success
    this.isDeleteTrxEntrySuccess$.subscribe(del => {
      if (del) {
        this.hideDeleteEntryModal();
        this.entryDeleted.emit(true);
      }
    });
  }
  public addBlankTrx(type: string = 'DEBIT', txn: ITransactionItem, event: Event) {
    let lastTxn = last(filter(this.vm.selectedLedger.transactions, p => p.type === type));
    if (txn.particular.uniqueName && lastTxn.particular.uniqueName) {
      this.vm.selectedLedger.transactions.push(this.vm.blankTransactionItem(type));
    }
  }
  public onUploadOutput(output: UploadOutput): void {
    if (output.type === 'allAddedToQueue') {
      let sessionKey = null;
      let companyUniqueName = null;
      this.sessionKey$.take(1).subscribe(a => sessionKey = a);
      this.companyName$.take(1).subscribe(a => companyUniqueName = a);
      const event: UploadInput = {
        type: 'uploadAll',
        url: LEDGER_API.UPLOAD_FILE.replace(':companyUniqueName', companyUniqueName),
        method: 'POST',
        fieldName: 'file',
        data: { company: companyUniqueName },
        headers: { 'Session-Id': sessionKey },
        concurrency: 0
      };
      this.uploadInput.emit(event);
    } else if (output.type === 'start') {
      this.isFileUploading = true;
    } else if (output.type === 'done') {
      if (output.file.response.status === 'success') {
        // this.isFileUploading = false;
        this.vm.selectedLedger.attachedFile = output.file.response.body.uniqueName;
        this.vm.selectedLedger.attachedFileName = output.file.response.body.name;
        this._toasty.successToast('file uploaded successfully');
      } else {
        this.isFileUploading = false;
        this.vm.selectedLedger.attachedFile = '';
        this.vm.selectedLedger.attachedFileName = '';
        this._toasty.errorToast(output.file.response.message);
      }
    }
  }
  public selectAccount(e, txn) {
    this.vm.onTxnAmountChange();
    if (!e.value) {
      // if there's no selected account set selectedAccount to null
      this.selectedAccount = null;
      // reset taxes and discount on selected account change
      // txn.tax = 0;
      // txn.taxes = [];
      // txn.discount = 0;
      // txn.discounts = [];
      return;
    }
    this.vm.flatternAccountList4Select2.take(1).subscribe(data => {
      data.map(fa => {
        // change (e.value[0]) to e.value to use in single select for ledger transaction entry
        if (fa.id === e.value) {
          this.selectedAccount = fa.additional;
          // reset taxes and discount on selected account change
          // txn.tax = 0;
          // txn.taxes = [];
          // txn.discount = 0;
          // txn.discounts = [];
          return;
        }
      });
    });
  }
  public showDeleteAttachedFileModal() {
    this.deleteAttachedFileModal.show();
  }
  public hideDeleteAttachedFileModal() {
    this.deleteAttachedFileModal.hide();
  }
  public showDeleteEntryModal() {
    this.deleteEntryModal.show();
  }
  public hideDeleteEntryModal() {
    this.deleteEntryModal.hide();
  }
  public deleteTrxEntry() {
    let entryName: string = null;
    this.entryUniqueName$.take(1).subscribe(en => entryName = en);
    this.store.dispatch(this._ledgerAction.deleteTrxEntry(this.accountUniqueName, entryName));
  }
  public deleteAttachedFile() {
    this.vm.selectedLedger.attachedFile = '';
    this.vm.selectedLedger.attachedFileName = '';
    this.hideDeleteAttachedFileModal();
  }
  public ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
