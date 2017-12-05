import { AfterViewInit, Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { LedgerService } from '../../../services/ledger.service';
import { DownloadLedgerRequest, LedgerResponse } from '../../../models/api-models/Ledger';
import { AppState } from '../../../store';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Rx';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { TaxResponse } from '../../../models/api-models/Company';
import { UploadInput, UploadOutput } from 'ngx-uploader';
import { ToasterService } from '../../../services/toaster.service';
import { LEDGER_API } from '../../../services/apiurls/ledger.api';
import { ModalDirective } from 'ngx-bootstrap';
import { AccountService } from '../../../services/account.service';
import { ILedgerTransactionItem } from '../../../models/interfaces/ledger.interface';
import { filter, last, orderBy } from '../../../lodash-optimized';
import { LedgerActions } from '../../../actions/ledger/ledger.actions';
import { UpdateLedgerVm } from './updateLedger.vm';
import { UpdateLedgerDiscountComponent } from '../updateLedgerDiscount/updateLedgerDiscount.component';
import { AccountResponse } from '../../../models/api-models/Account';
import { IOption } from '../../../theme/ng-virtual-select/sh-options.interface';
import { ShSelectComponent } from '../../../theme/ng-virtual-select/sh-select.component';
import { IFlattenAccountsResultItem } from '../../../models/interfaces/flattenAccountsResultItem.interface';
import { base64ToBlob } from '../../../shared/helpers/helperFunctions';
import { saveAs } from 'file-saver';

@Component({
  selector: 'update-ledger-entry-panel',
  templateUrl: './updateLedgerEntryPanel.component.html',
  styleUrls: ['./updateLedgerEntryPanel.component.css']
})
export class UpdateLedgerEntryPanelComponent implements OnInit, AfterViewInit, OnDestroy {
  public vm: UpdateLedgerVm;
  @Output() public closeUpdateLedgerModal: EventEmitter<boolean> = new EventEmitter();
  @ViewChild('deleteAttachedFileModal') public deleteAttachedFileModal: ModalDirective;
  @ViewChild('deleteEntryModal') public deleteEntryModal: ModalDirective;
  @ViewChild('updateTaxModal') public updateTaxModal: ModalDirective;
  @ViewChild('discount') public discountComponent: UpdateLedgerDiscountComponent;
  public sessionKey$: Observable<string>;
  public companyName$: Observable<string>;
  public isFileUploading: boolean = false;
  public accountUniqueName: string;
  public entryUniqueName$: Observable<string>;
  public editAccUniqueName$: Observable<string>;
  public entryUniqueName: string;
  public companyTaxesList$: Observable<TaxResponse[]>;
  public uploadInput: EventEmitter<UploadInput>;
  public isDeleteTrxEntrySuccess$: Observable<boolean>;
  public isTxnUpdateInProcess$: Observable<boolean>;
  public isTxnUpdateSuccess$: Observable<boolean>;
  public flattenAccountListStream$: Observable<IFlattenAccountsResultItem[]>;
  public selectedLedgerStream$: Observable<LedgerResponse>;
  public activeAccount$: Observable<AccountResponse>;
  public ledgerUnderStandingObj = {
    accountType: '',
    text: {
      cr: '',
      dr: ''
    },
    balanceText: {
      cr: '',
      dr: ''
    }
  };
  public destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  public showAdvanced: boolean;

  constructor(private store: Store<AppState>, private _ledgerService: LedgerService,
              private _toasty: ToasterService, private _accountService: AccountService,
              private _ledgerAction: LedgerActions) {
    this.entryUniqueName$ = this.store.select(p => p.ledger.selectedTxnForEditUniqueName).takeUntil(this.destroyed$);
    this.editAccUniqueName$ = this.store.select(p => p.ledger.selectedAccForEditUniqueName).takeUntil(this.destroyed$);
    this.selectedLedgerStream$ = this.store.select(p => p.ledger.transactionDetails).takeUntil(this.destroyed$);
    this.flattenAccountListStream$ = this.store.select(p => p.general.flattenAccounts).takeUntil(this.destroyed$);
    this.companyTaxesList$ = this.store.select(p => p.company.taxes).takeUntil(this.destroyed$);
    this.sessionKey$ = this.store.select(p => p.session.user.session.id).takeUntil(this.destroyed$);
    this.companyName$ = this.store.select(p => p.session.companyUniqueName).takeUntil(this.destroyed$);
    this.isDeleteTrxEntrySuccess$ = this.store.select(p => p.ledger.isDeleteTrxEntrySuccessfull).takeUntil(this.destroyed$);
    this.isTxnUpdateInProcess$ = this.store.select(p => p.ledger.isTxnUpdateInProcess).takeUntil(this.destroyed$);
    this.isTxnUpdateSuccess$ = this.store.select(p => p.ledger.isTxnUpdateSuccess).takeUntil(this.destroyed$);
    this.closeUpdateLedgerModal.takeUntil(this.destroyed$);
  }

  public ngOnInit() {
    this.showAdvanced = false;
    this.vm = new UpdateLedgerVm();
    this.vm.selectedLedger = new LedgerResponse();
    // TODO: save backup of response for future use
    // get Account name from url
    this.editAccUniqueName$.subscribe(uniqueName => {
      if (uniqueName) {
        this.accountUniqueName = uniqueName;
      }
    });

    // emit upload event
    this.uploadInput = new EventEmitter<UploadInput>();

    //  get entry from server
    this.entryUniqueName$.subscribe(entryName => {
      this.entryUniqueName = entryName;
      if (entryName) {
        this.store.dispatch(this._ledgerAction.getLedgerTrxDetails(this.accountUniqueName, entryName));
        // get flatten_accounts list && get transactions list
        Observable.combineLatest(this.flattenAccountListStream$, this.selectedLedgerStream$, this._accountService.GetAccountDetails(this.accountUniqueName))
          .subscribe((resp: any[]) => {
            if (resp[0] && resp[1] && resp[2].status === 'success') {
              //#region flattern group list assign process
              this.vm.flatternAccountList = _.cloneDeep(resp[0]);
              this.activeAccount$ = Observable.of(resp[2].body);
              let accountDetails: AccountResponse = resp[2].body;
              let parentOfAccount = accountDetails.parentGroups[0];
              // check if account is stockable
              let isStockableAccount = parentOfAccount ?
                (parentOfAccount.uniqueName === 'revenuefromoperations' || parentOfAccount.uniqueName === 'otherincome' ||
                  parentOfAccount.uniqueName === 'operatingcost' || parentOfAccount.uniqueName === 'indirectexpenses') : false;
              let accountsArray: IOption[] = [];
              if (isStockableAccount && accountDetails.stocks && accountDetails.stocks.length > 0) {
                // stocks from ledger account
                resp[0].map(acc => {
                  // normal entry
                  accountsArray.push({value: acc.uniqueName, label: acc.name, additional: acc});
                  accountDetails.stocks.map(as => {
                    // stock entry
                    accountsArray.push({
                      value: `${acc.uniqueName}#${as.uniqueName}`,
                      label: acc.name + '(' + as.uniqueName + ')',
                      additional: Object.assign({}, acc, {stock: as})
                    });
                  });
                });
              } else {
                resp[0].map(acc => {
                  if (acc.stocks) {
                    acc.stocks.map(as => {
                      accountsArray.push({
                        value: `${acc.uniqueName}#${as.uniqueName}`,
                        label: `${acc.name} (${as.uniqueName})`,
                        additional: Object.assign({}, acc, {stock: as})
                      });
                    });
                    accountsArray.push({value: acc.uniqueName, label: acc.name, additional: acc});
                  } else {
                    accountsArray.push({value: acc.uniqueName, label: acc.name, additional: acc});
                  }
                });
              }
              this.vm.flatternAccountList4Select = Observable.of(orderBy(accountsArray, 'text'));
              //#endregion
              //#region transaction assignment process
              this.vm.selectedLedger = resp[1];
              this.vm.selectedLedgerBackup = resp[1];

              this.vm.selectedLedger.transactions.map(t => {
                if (t.inventory) {
                  let findStocks = accountsArray.find(f => f.value === t.particular.uniqueName + '#' + t.inventory.stock.uniqueName);
                  if (findStocks) {
                    let findUnitRates = findStocks.additional.stock;
                    if (findUnitRates && findUnitRates.accountStockDetails && findUnitRates.accountStockDetails.unitRates.length) {
                      let tempUnitRates = findUnitRates.accountStockDetails.unitRates;
                      tempUnitRates.map(tmp => tmp.code = tmp.stockUnitCode);
                      t.unitRate = tempUnitRates;
                    } else {
                      t.unitRate = [{
                        code: t.inventory.unit.code,
                        rate: t.inventory.rate,
                        stockUnitCode: t.inventory.unit.code
                      }];
                    }
                  } else {
                    t.unitRate = [{
                      code: t.inventory.unit.code,
                      rate: t.inventory.rate,
                      stockUnitCode: t.inventory.unit.code
                    }];
                  }
                  t.particular.uniqueName = `${t.particular.uniqueName}#${t.inventory.stock.uniqueName}`;
                }
              });
              this.vm.isInvoiceGeneratedAlready = this.vm.selectedLedger.invoiceGenerated;
              if (this.vm.selectedLedger.total.type === 'DEBIT') {
                this.vm.selectedLedger.transactions.push(this.vm.blankTransactionItem('CREDIT'));
              } else {
                this.vm.selectedLedger.transactions.push(this.vm.blankTransactionItem('DEBIT'));
              }
              let incomeExpenseEntryLength = this.vm.isThereIncomeOrExpenseEntry();
              this.vm.showNewEntryPanel = (incomeExpenseEntryLength > 0 && incomeExpenseEntryLength < 2);
              this.vm.getEntryTotal();
              this.vm.reInitilizeDiscount();
              this.vm.generatePanelAmount();
              this.vm.generateGrandTotal();
              this.vm.generateCompoundTotal();
              //#endregion
            }
          });
      }
    });

    // check if delete entry is success
    this.isDeleteTrxEntrySuccess$.subscribe(del => {
      if (del) {
        this.store.dispatch(this._ledgerAction.resetDeleteTrxEntryModal());
        this.closeUpdateLedgerModal.emit(true);
      }
    });

    // check if update entry is success
    this.isTxnUpdateSuccess$.subscribe(upd => {
      if (upd) {
        this.store.dispatch(this._ledgerAction.ResetUpdateLedger());
        // this.closeUpdateLedgerModal.emit(true);
      }
    });
  }

  public ngAfterViewInit() {
    this.vm.discountComponent = this.discountComponent;
  }

  public addBlankTrx(type: string = 'DEBIT', txn: ILedgerTransactionItem, event: Event) {
    if (Number(txn.amount) === 0) {
      txn.amount = undefined;
    }
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
        data: {company: companyUniqueName},
        headers: {'Session-Id': sessionKey},
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

  public selectAccount(e: IOption, txn: ILedgerTransactionItem, selectCmp: ShSelectComponent) {
    if (!e.value) {
      // if there's no selected account set selectedAccount to null
      txn.selectedAccount = null;
      txn.inventory = null;
      txn.particular.name = undefined;
      // check if need to showEntryPanel
      let incomeExpenseEntryLength = this.vm.isThereIncomeOrExpenseEntry();
      this.vm.showNewEntryPanel = (incomeExpenseEntryLength > 0 && incomeExpenseEntryLength < 2);
      // set discount amount to 0 when deselected account is type of discount category
      if (this.discountComponent) {
        this.vm.reInitilizeDiscount();
      }
      return;
    } else {
      if (!txn.isUpdated) {
        if (this.vm.selectedLedger.taxes.length && !txn.isTax) {
          txn.isUpdated = true;
        }
      }
      // check if txn.selectedAccount is aleready set so it means account name is changed without firing deselect event
      if (txn.selectedAccount) {
        // check if discount is added and update component as needed
        this.vm.discountArray.map(d => {
          if (d.particular === txn.selectedAccount.uniqueName) {
            d.amount = 0;
          }
        });
        if (this.discountComponent) {
          this.discountComponent.genTotal();
        }
      }
      // if ther's stock entry
      if (e.additional.stock) {
        // check if we aleready have stock entry
        if (this.vm.isThereStockEntry()) {
          selectCmp.clear();
          txn.particular.uniqueName = null;
          txn.particular.name = null;
          txn.selectedAccount = null;
          this._toasty.warningToast('you can\'t add multiple stock entry');
          return;
        } else {
          // add unitArrys in txn for stock entry
          txn.selectedAccount = e.additional;
          let rate = 0;
          let unitCode = '';
          let unitName = '';
          let stockName = '';
          let stockUniqueName = '';
          let unitArray = [];
          let defaultUnit = {
            stockUnitCode: e.additional.stock.stockUnit.name,
            code: e.additional.stock.stockUnit.code,
            rate: 0
          };
          if (e.additional.stock.accountStockDetails && e.additional.stock.accountStockDetails.unitRates) {
            let cond = e.additional.stock.accountStockDetails.unitRates.find(p => p.stockUnitCode === e.additional.stock.stockUnit.code);
            if (cond) {
              defaultUnit.rate = cond.rate;
              rate = defaultUnit.rate;
            }
            unitArray = unitArray.concat(e.additional.stock.accountStockDetails.unitRates.map(p => {
              return {
                stockUnitCode: p.stockUnitCode,
                code: p.stockUnitCode,
                rate: p.rate
              };
            }));
            if (unitArray.findIndex(p => p.code === defaultUnit.code) === -1) {
              unitArray.push(defaultUnit);
            }
          } else {
            unitArray.push(defaultUnit);
          }
          txn.unitRate = unitArray;
          stockName = e.additional.stock.name;
          stockUniqueName = e.additional.stock.uniqueName;
          unitName = e.additional.stock.stockUnit.name;
          unitCode = e.additional.stock.stockUnit.code;

          if (stockName && stockUniqueName) {
            txn.inventory = {
              stock: {
                name: stockName,
                uniqueName: stockUniqueName,
              },
              quantity: 1,
              unit: {
                stockUnitCode: unitCode,
                code: unitCode,
                rate
              },
              amount: 0,
              rate
            };
          }
          if (rate > 0 && txn.amount === 0) {
            txn.amount = rate;
          }
        }
      } else {
        // directly assign additional property
        txn.selectedAccount = e.additional;
      }
      // check if need to showEntryPanel
      let incomeExpenseEntryLength = this.vm.isThereIncomeOrExpenseEntry();
      this.vm.showNewEntryPanel = (incomeExpenseEntryLength > 0 && incomeExpenseEntryLength < 2);
      this.vm.reInitilizeDiscount();
      this.vm.onTxnAmountChange(txn);
    }
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

  public showUpdateTaxModal() {
    this.updateTaxModal.show();
  }

  public updateTaxes() {
    this.updateTaxModal.hide();
    let requestObj: LedgerResponse = this.vm.prepare4Submit();
    requestObj.transactions = requestObj.transactions.filter(tx => !tx.isTax);
    this.store.dispatch(this._ledgerAction.updateTxnEntry(requestObj, this.accountUniqueName, this.entryUniqueName));
  }

  public hideUpdateTaxModal() {
    this.updateTaxModal.hide();

    let requestObj: LedgerResponse = this.vm.prepare4Submit();
    requestObj.taxes = [];
    this.store.dispatch(this._ledgerAction.updateTxnEntry(requestObj, this.accountUniqueName, this.entryUniqueName));
  }

  public deleteTrxEntry() {
    let entryName: string = null;
    this.entryUniqueName$.take(1).subscribe(en => entryName = en);
    this.store.dispatch(this._ledgerAction.deleteTrxEntry(this.accountUniqueName, entryName));
    this.hideDeleteEntryModal();
  }

  public deleteAttachedFile() {
    this.vm.selectedLedger.attachedFile = '';
    this.vm.selectedLedger.attachedFileName = '';
    this.hideDeleteAttachedFileModal();
  }

  public saveLedgerTransaction() {
    let requestObj: LedgerResponse = this.vm.prepare4Submit();
    let isThereUpdatedEntry = requestObj.transactions.find(t => t.isUpdated);
    // if their's any changes
    if (isThereUpdatedEntry) {
      this.showUpdateTaxModal();
    } else {
      // if their's no change fire action straightaway
      this.store.dispatch(this._ledgerAction.updateTxnEntry(requestObj, this.accountUniqueName, this.entryUniqueName));
    }
  }

  public ngOnDestroy(): void {
    this.vm.resetVM();
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  public downloadAttachedFile(fileName: string, e: Event) {
    e.stopPropagation();
    this._ledgerService.DownloadAttachement(fileName).subscribe(d => {
      if (d.status === 'success') {
        let blob = base64ToBlob(d.body.uploadedFile, `image/${d.body.fileType}`, 512);
        return saveAs(blob, d.body.name);
      } else {
        this._toasty.errorToast(d.message);
      }
    });
  }

  public downloadInvoice(invoiceName: string, e: Event) {
    e.stopPropagation();
    let activeAccount = null;
    this.activeAccount$.take(1).subscribe(p => activeAccount = p);
    let downloadRequest = new DownloadLedgerRequest();
    downloadRequest.invoiceNumber = [invoiceName];

    this._ledgerService.DownloadInvoice(downloadRequest, activeAccount.uniqueName).subscribe(d => {
      if (d.status === 'success') {
        let blob = base64ToBlob(d.body, 'application/pdf', 512);
        return saveAs(blob, `${activeAccount.name} - ${invoiceName}.pdf`);
      } else {
        this._toasty.errorToast(d.message);
      }
    });
  }
}
