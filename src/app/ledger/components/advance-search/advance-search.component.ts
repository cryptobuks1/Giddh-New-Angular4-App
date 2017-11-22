import { InventoryAction } from './../../../services/actions/inventory/inventory.actions';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { Subscription } from 'rxjs/Rx';
import { LedgerActions } from './../../../services/actions/ledger/ledger.actions';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ILedgerAdvanceSearchRequest, Inventory } from './../../../models/api-models/Ledger';
import { CompanyActions } from './../../../services/actions/company.actions';
import { AppState } from './../../../store/roots';
import { Store } from '@ngrx/store';
import { IOption } from './../../../theme/ng-select/option.interface';
import { AccountService } from './../../../services/account.service';
import { AccountResponseV2 } from './../../../models/api-models/Account';
import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { IRoleCommonResponseAndRequest } from '../../../models/api-models/Permission';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import * as moment from 'moment';

const COMPARISON_FILTER = [
  { label: 'Greater Than', value: 'greaterThan' },
  { label: 'Less Than', value: 'lessThan' },
  { label: 'Greater Than or Equals', value: 'greaterThanOrEquals' },
  { label: 'Less Than or Equals', value: 'lessThanOrEquals' },
  { label: 'Equals', value: 'equals' }
];
@Component({
  selector: 'advance-search-model',
  templateUrl: './advance-search.component.html'
})

export class AdvanceSearchModelComponent implements OnInit {

  @Input() public accountUniqueName: string;
  @Output() public closeModelEvent: EventEmitter<boolean> = new EventEmitter(true);

  public advanceSearchObject: ILedgerAdvanceSearchRequest = null;
  public advanceSearchForm: FormGroup;
  public showOtherDetails: boolean = false;
  public showChequeDatePicker: boolean  = false;
  public bsConfig: Partial<BsDatepickerConfig> = {showWeekNumbers: false, dateInputFormat: 'DD-MM-YYYY'};
  public accounts$: Observable<IOption[]>;
  public voucherTypeList: Observable<IOption[]>;
  public stockListDropDown$: Observable<IOption[]>;
  public comparisonFilterDropDown$: Observable<IOption[]>;

  public includeParticularsState: string = 'all';

  // public activeAccount$: Observable<AccountResponseV2>;
  // public accounts$: Observable<IOption[]>;
  // public selectedAccountForMerge: any = [];
  // public checkModel: string = 'all';

  private moment = moment;
  private fromDate: string = '';
  private toDate: string = '';
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(private inventoryAction: InventoryAction, private store: Store<AppState>, private fb: FormBuilder, private _ledgerActions: LedgerActions, private _accountService: AccountService ) {

    this.advanceSearchForm = this.fb.group({
      uniqueNames: [[]],
      isInvoiceGenerated: [false],
      amountLessThan: [false],
      includeAmount: [false],
      amountEqualTo: [false],
      amountGreaterThan: [false],
      amount: ['', Validators.required],
      includeDescription: ['', Validators.required],
      description: ['', Validators.required],
      includeTag: ['', Validators.required],
      includeParticulars: [false, Validators.required],
      includeVouchers: ['', Validators.required],
      chequeNumber: ['', Validators.required],
      dateOnCheque: ['', Validators.required],
      tags: this.fb.array([]),
      particulars: [[]],
      vouchers: [[]],
      inventory: this.fb.group({
        includeInventory: true,
        inventories: ['BLUEPEN1'],
        quantity: 1,
        includeQuantity: true,
        quantityLessThan: false,
        quantityEqualTo: true,
        quantityGreaterThan: true,
        includeItemValue: true,
        itemValue: 20,
        includeItemLessThan: true,
        includeItemEqualTo: true,
        includeItemGreaterThan: false
      }),
    });

    this.setVoucherTypes();
    this.comparisonFilterDropDown$ = Observable.of(COMPARISON_FILTER);
    this.store.dispatch(this.inventoryAction.GetManufacturingStock());

  }

  public ngOnInit() {
    this._accountService.GetFlattenAccounts('', '').takeUntil(this.destroyed$).subscribe(data => {
      if (data.status === 'success') {
        let accounts: IOption[] = [];
        data.body.results.map(d => {
          accounts.push({label: d.name, value: d.uniqueName});
        });
        this.accounts$ = Observable.of(accounts);
      }
    });

    this.stockListDropDown$ = this.store.select(p => {
      let data = _.cloneDeep(p);
      if (data.inventory.manufacturingStockList) {
        if (data.inventory.manufacturingStockList.results) {
          let units = data.inventory.manufacturingStockList.results;

          return units.map(unit => {
            return {label: ` ${unit.name} (${unit.uniqueName})`, value: unit.uniqueName};
          });
        }
      }
    }).takeUntil(this.destroyed$);
  }

  public setVoucherTypes() {
    this.voucherTypeList = Observable.of([{
      label: 'Sales',
      value: 'sal'
    }, {
      label: 'Purchases',
      value: 'pur'
    }, {
      label: 'Receipt',
      value: 'rcpt'
    }, {
      label: 'Payment',
      value: 'pay'
    }, {
      label: 'Journal',
      value: 'jr'
    }, {
      label: 'Contra',
      value: 'cntr'
    }, {
      label: 'Debit Note',
      value: 'debit note'
    }, {
      label: 'Credit Note',
      value: 'credit note'
    }]);
  }

  public onCancel() {
    this.closeModelEvent.emit(true);
  }

  /**
   * onDateRangeSelected
   */
  public onDateRangeSelected(data) {
    this.fromDate = moment(data[0]).format('DD-MM-YYYY');
    this.toDate = moment(data[1]).format('DD-MM-YYYY');
  }

  /**
   * onSearch
   */
  public onSearch() {
    let dataToSend = _.cloneDeep(this.advanceSearchForm.value);
    if (dataToSend.dateOnCheque) {
      dataToSend.dateOnCheque = moment(dataToSend.dateOnCheque).format('DD-MM-YYYY');
    }
    console.log('advanceSearchForm is :', dataToSend);
    this.store.dispatch(this._ledgerActions.doAdvanceSearch(dataToSend, this.accountUniqueName, this.fromDate, this.toDate));
  }

  /**
   * onDDElementSelect
   */
  public onDDElementSelect(type: string, data: any[]) {
    let values = [];
    data.forEach(element => {
      values.push(element.value);
    });
    switch (type) {
      case 'particulars':
        this.advanceSearchForm.get('particulars').patchValue(values);
      break;
      case 'uniqueNames':
        this.advanceSearchForm.get('uniqueNames').patchValue(values);
      break;
      case 'vouchers':
        this.advanceSearchForm.get('vouchers').patchValue(values);
      break;
      case 'inventory':
        this.advanceSearchForm.get('inventory.inventories').patchValue(values);
      break;
    }
  }

  /**
   * onDDClear
   */
  public onDDClear(type: string) {
    this.onDDElementSelect(type, []);
  }

  /**
   * onButtonGroupClick
   */
  public onButtonGroupClick(groupName: string, value: string) {
    switch (groupName + '-' + value) {
      case 'particulars-all':
        this.includeParticularsState = 'all';
        this.accounts$.subscribe(data => {
          if (data && data.length) {
            this.onDDElementSelect('particulars', data);
          }
        });
        this.advanceSearchForm.get('includeParticulars').patchValue(true);
      break;
      case 'particulars-include':
        this.includeParticularsState = 'include';
        this.advanceSearchForm.get('includeParticulars').patchValue(true);
      break;
      case 'particulars-exclude':
      this.includeParticularsState = 'exclude';
      this.advanceSearchForm.get('particulars').patchValue([]);
      this.advanceSearchForm.get('includeParticulars').patchValue(false);
      break;
    }
  }
}
