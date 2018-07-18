import { animate, Component, OnDestroy, OnInit, state, style, transition, trigger, ViewChild } from '@angular/core';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { AppState } from '../store/roots';
import { ToasterService } from '../services/toaster.service';
import { StateDetailsRequest } from '../models/api-models/Company';
import { CompanyActions } from '../actions/company.actions';
import { Router } from '@angular/router';
import { IOption } from 'app/theme/ng-virtual-select/sh-options.interface';
import { DashboardService } from '../services/dashboard.service';
import { ContactService } from '../services/contact.service';
import { BsDropdownDirective, ModalDirective } from 'ngx-bootstrap';
import { CashfreeClass } from '../models/api-models/SettingsIntegraion';
import { IFlattenAccountsResultItem } from '../models/interfaces/flattenAccountsResultItem.interface';
import { SettingsIntegrationActions } from '../actions/settings/settings.integration.action';
import { createSelector } from 'reselect';

const CustomerType = [
  {label: 'Customer', value: 'customer'},
  {label: 'Vendor', value: 'vendor'}
];

export interface PayNowRequest {
  accountUniqueName: string;
  amount: number;
  description: string;
}

@Component({
  selector: 'contact-detail',
  templateUrl: './contact.component.html',
  styles: [`
    .dropdown-menu > li > a {
      padding: 2px 10px;
    }
  `],
  animations: [
    trigger('slideInOut', [
      state('in', style({
        transform: 'translate3d(0, 0, 0)'
      })),
      state('out', style({
        transform: 'translate3d(100%, 0, 0)'
      })),
      transition('in => out', animate('400ms ease-in-out')),
      transition('out => in', animate('400ms ease-in-out'))
    ]),
  ]
})

export class ContactComponent implements OnInit, OnDestroy {
  public CustomerType = CustomerType;
  public flattenAccounts: any = [];
  public sundryDebtorsAccountsBackup: any = {};
  public sundryDebtorsAccounts$: Observable<any>;
  public sundryCreditorsAccountsBackup: any = {};
  public sundryCreditorsAccounts$: Observable<any>;
  public activeTab: string = 'customer';
  public accountAsideMenuState: string = 'out';
  public asideMenuStateForProductService: string = 'out';
  public selectedAccForPayment: any;
  public selectedGroupForCreateAcc: 'sundrydebtors' | 'sundrycreditors' = 'sundrydebtors';
  public cashFreeAvailableBalance: number;
  public payoutForm: CashfreeClass;
  public bankAccounts$: Observable<IOption[]>;
  public flattenAccountsStream$: Observable<IFlattenAccountsResultItem[]>;
  public payoutObj: CashfreeClass = new CashfreeClass();
  public showFieldFilter = {
    name: true,
    due_amount: true,
    email: true,
    mobile: true,
    closingBalance: true,
    state: true,
    gstin: true,
  };

  @ViewChild('payNowModal') public payNowModal: ModalDirective;
  @ViewChild('filterDropDownList') public filterDropDownList: BsDropdownDirective;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  private createAccountIsSuccess$: Observable<boolean>;

  constructor(
    private store: Store<AppState>,
    private _toasty: ToasterService,
    private router: Router,
    private _dashboardService: DashboardService,
    private _contactService: ContactService,
    private settingsIntegrationActions: SettingsIntegrationActions,
    private _companyActions: CompanyActions) {
    this.createAccountIsSuccess$ = this.store.select(s => s.groupwithaccounts.createAccountIsSuccess).takeUntil(this.destroyed$);
    this.flattenAccountsStream$ = this.store.select(createSelector([(s: AppState) => s.general.flattenAccounts], (s) => {
      // console.log('flattenAccountsStream$');
      return s;
    })).takeUntil(this.destroyed$);
    // this.flattenAccountsStream$ = this.store.select(s => s.general.flattenAccounts).takeUntil(this.destroyed$);

  }

  public ngOnInit() {

    this.filterDropDownList.placement = 'left';

    let companyUniqueName = null;
    this.store.select(c => c.session.companyUniqueName).take(1).subscribe(s => companyUniqueName = s);
    let stateDetailsRequest = new StateDetailsRequest();
    stateDetailsRequest.companyUniqueName = companyUniqueName;
    stateDetailsRequest.lastState = 'contact';

    this.store.dispatch(this._companyActions.SetStateDetails(stateDetailsRequest));

    this.getAccounts('sundrydebtors', null, null, 'false');

    this.createAccountIsSuccess$.takeUntil(this.destroyed$).subscribe((yes: boolean) => {
      if (yes) {
        this.toggleAccountAsidePane();
        this.getAccounts('sundrydebtors', null, null, 'true');
      }
    });

    this.getCashFreeBalance();

    this.flattenAccountsStream$.subscribe(data => {
      // console.log('flattenAccountsStream', data);
      if (data) {
        let accounts: IOption[] = [];
        let bankAccounts: IOption[] = [];
        _.forEach(data, (item) => {
          accounts.push({label: item.name, value: item.uniqueName});
          let findBankIndx = item.parentGroups.findIndex((grp) => grp.uniqueName === 'bankaccounts');
          if (findBankIndx !== -1) {
            bankAccounts.push({label: item.name, value: item.uniqueName});
          }
        });
        this.bankAccounts$ = Observable.of(accounts);
      }
    });
  }

  public setActiveTab(tabName: 'customer' | 'vendor', type: string) {
    this.activeTab = tabName;
    this.getAccounts(type, null, null, 'true');
  }

  public search(ev: any) {
    let searchStr = ev.target.value ? ev.target.value.toLowerCase() : '';
    if (this.activeTab === 'customer') {
      this.sundryDebtorsAccounts$ = Observable.of(this.sundryDebtorsAccountsBackup.results.filter((acc) => acc.name.toLowerCase().includes(searchStr)));
    } else {
      this.sundryCreditorsAccounts$ = Observable.of(this.sundryCreditorsAccountsBackup.results.filter((acc) => acc.name.toLowerCase().includes(searchStr)));
    }
  }

  public ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  public openAddAndManage(openFor: 'customer' | 'vendor') {
    this.selectedGroupForCreateAcc = openFor === 'customer' ? 'sundrydebtors' : 'sundrycreditors';
    this.toggleAccountAsidePane();
  }

  public toggleAccountAsidePane(event?): void {
    if (event) {
      event.preventDefault();
    }
    this.accountAsideMenuState = this.accountAsideMenuState === 'out' ? 'in' : 'out';
    this.toggleBodyClass();
  }

  public toggleBodyClass() {
    if (this.accountAsideMenuState === 'in') {
      document.querySelector('body').classList.add('fixed');
    } else {
      document.querySelector('body').classList.remove('fixed');
    }
  }

  public payNow(acc: string) {
    this.selectedAccForPayment = acc;
    this.payNowModal.show();
  }

  public onPaymentModalCancel() {
    this.payNowModal.hide();
  }

  public onConfirmation(amountToPay: number) {
    let payNowData: PayNowRequest = {
      accountUniqueName: this.selectedAccForPayment.uniqueName,
      amount: amountToPay,
      description: ''
    };

    this._contactService.payNow(payNowData).subscribe((res) => {
      if (res.status === 'success') {
        this._toasty.successToast('Payment done successfully with reference id: ' + res.body.referenceId);
      } else {
        this._toasty.errorToast(res.message, res.code);
      }
    });
  }

  public selectCashfreeAccount(event: IOption, objToApnd) {
    let accObj = {
      name: event.label,
      uniqueName: event.value
    };
    objToApnd.account = accObj;
  }

  public submitCashfreeDetail(f) {
    if (f && f.userName && f.password) {
      let objToSend = _.cloneDeep(f);
      this.store.dispatch(this.settingsIntegrationActions.SaveCashfreeDetails(objToSend));
    } else {
      this._toasty.errorToast('Please enter Cashfree details.', 'Validation');
      return;
    }
  }

  public pageChanged(event: any): void {
    let selectedGrp = this.activeTab === 'customer' ? 'sundrydebtors' : 'sundrycreditors';
    this.getAccounts(selectedGrp, event.page, 'pagination');
  }

  public hideListItems() {
    this.filterDropDownList.hide();
  }

  private getAccounts(groupUniqueName: string, pageNumber?: number, requestedFrom?: string, refresh?: string) {
    pageNumber = pageNumber ? pageNumber : 1;
    refresh = refresh ? refresh : 'false';
    this._contactService.GetContacts(groupUniqueName, pageNumber, refresh).subscribe((res) => {
      if (res.status === 'success') {
        if (groupUniqueName === 'sundrydebtors') {
          this.sundryDebtorsAccountsBackup = res.body;
          this.sundryDebtorsAccounts$ = Observable.of(res.body.results);
          // if (requestedFrom !== 'pagination') {
          //   this.getAccounts('sundrycreditors', pageNumber, null, 'true');
          // }
        } else {
          this.sundryCreditorsAccountsBackup = res.body;
          this.sundryCreditorsAccounts$ = Observable.of(res.body.results);
        }
      }
    });
  }

  private getCashFreeBalance() {
    this._contactService.GetCashFreeBalance().subscribe((res) => {
      if (res.status === 'success') {
        this.cashFreeAvailableBalance = res.body.availableBalance;
      }
    });
  }
}
