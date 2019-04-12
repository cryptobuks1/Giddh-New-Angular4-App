import { combineLatest, Observable, of as observableOf, ReplaySubject, Subscription } from 'rxjs';
import { AuthService } from '../../theme/ng-social-login-module/index';
import { debounceTime, distinctUntilChanged, take, takeUntil } from 'rxjs/operators';
import { GIDDH_DATE_FORMAT } from './../helpers/defaultDateFormat';
import { CompanyAddNewUiComponent, ManageGroupsAccountsComponent } from './components';
import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, ComponentFactoryResolver, ElementRef, EventEmitter, HostListener, NgZone, OnDestroy, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { BsDropdownDirective, BsModalRef, BsModalService, ModalDirective, ModalOptions, TabsetComponent } from 'ngx-bootstrap';
import { AppState } from '../../store';
import { LoginActions } from '../../actions/login.action';
import { CompanyActions } from '../../actions/company.actions';
import { ActiveFinancialYear, CompanyResponse } from '../../models/api-models/Company';
import { UserDetails } from '../../models/api-models/loginModels';
import { GroupWithAccountsAction } from '../../actions/groupwithaccounts.actions';
import { ActivatedRoute, NavigationEnd, NavigationStart, RouteConfigLoadEnd, Router } from '@angular/router';
import * as _ from 'lodash';
import { ElementViewContainerRef } from '../helpers/directives/elementViewChild/element.viewchild.directive';
import { FlyAccountsActions } from '../../actions/fly-accounts.actions';
import { FormControl } from '@angular/forms';
import { userLoginStateEnum } from '../../store/authentication/authentication.reducer';
import { GeneralActions } from '../../actions/general/general.actions';
import { createSelector } from 'reselect';
import * as moment from 'moment/moment';
import { AuthenticationService } from '../../services/authentication.service';
import { ICompAidata, IUlist } from '../../models/interfaces/ulist.interface';
import { cloneDeep, concat, sortBy } from '../../lodash-optimized';
import { DbService } from '../../services/db.service';
import { CompAidataModel } from '../../models/db';
import { WindowRef } from '../helpers/window.object';
import { AccountResponse } from 'app/models/api-models/Account';
import { GeneralService } from 'app/services/general.service';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';

export const NAVIGATION_ITEM_LIST: IUlist[] = [
  {type: 'MENU', name: 'Dashboard', uniqueName: '/pages/home'},
  {type: 'MENU', name: 'Journal Voucher', uniqueName: '/pages/accounting-voucher'},
  {type: 'MENU', name: 'Sales Invoice', uniqueName: '/pages/sales'},
  {type: 'MENU', name: 'Invoice', uniqueName: '/pages/invoice/preview/sales'},
  {type: 'MENU', name: 'Receipt', uniqueName: '/pages/invoice/receipt'},
  {type: 'MENU', name: 'Debit Credit Note', uniqueName: '/pages/invoice/preview/credit note'},
  {type: 'MENU', name: 'Invoice > Generate', uniqueName: '/pages/invoice/generate/sales'},
  {type: 'MENU', name: 'Invoice > Templates', uniqueName: '/pages/invoice/templates/sales'},
  {type: 'MENU', name: 'Invoice > Settings', uniqueName: '/pages/invoice/settings'},
  {type: 'MENU', name: 'Invoice > preview', uniqueName: '/pages/invoice/preview/sales'},
  {type: 'MENU', name: 'Daybook', uniqueName: '/pages/daybook'},
  {type: 'MENU', name: 'Trial Balance', uniqueName: '/pages/trial-balance-and-profit-loss', additional: {tab: 'trial-balance', tabIndex: 0}},
  {type: 'MENU', name: 'Profit & Loss', uniqueName: '/pages/trial-balance-and-profit-loss', additional: {tab: 'profit-and-loss', tabIndex: 1}},
  {type: 'MENU', name: 'Balance Sheet', uniqueName: '/pages/trial-balance-and-profit-loss', additional: {tab: 'balance-sheet', tabIndex: 2}},
  {type: 'MENU', name: 'Audit Logs', uniqueName: '/pages/audit-logs'},
  // { type: 'MENU', name: 'Taxes', uniqueName: '/pages/purchase/invoice' },
  {type: 'MENU', name: 'Inventory', uniqueName: '/pages/inventory'},
  {type: 'MENU', name: 'Manufacturing', uniqueName: '/pages/manufacturing/report'},
  {type: 'MENU', name: 'Search', uniqueName: '/pages/search'},
  {type: 'MENU', name: 'Permissions', uniqueName: '/pages/permissions/list'},
  {type: 'MENU', name: 'Settings', uniqueName: '/pages/settings'},
  {type: 'MENU', name: 'Settings > Taxes', uniqueName: '/pages/settings', additional: {tab: 'taxes', tabIndex: 0}},
  {type: 'MENU', name: 'Settings > Integration', uniqueName: '/pages/settings', additional: {tab: 'integration', tabIndex: 1}},
  {type: 'MENU', name: 'Settings > Linked Accounts', uniqueName: '/pages/settings', additional: {tab: 'linked-accounts', tabIndex: 2}},
  {type: 'MENU', name: 'Settings > Profile', uniqueName: '/pages/settings', additional: {tab: 'profile', tabIndex: 3}},
  {type: 'MENU', name: 'Settings > Financial Year', uniqueName: '/pages/settings', additional: {tab: 'financial-year', tabIndex: 4}},
  {type: 'MENU', name: 'Settings > Permission', uniqueName: '/pages/settings', additional: {tab: 'permission', tabIndex: 5}},
  {type: 'MENU', name: 'Settings > Branch', uniqueName: '/pages/settings', additional: {tab: 'branch', tabIndex: 6}},
  {type: 'MENU', name: 'Settings > Tag', uniqueName: '/pages/settings', additional: {tab: 'tag', tabIndex: 7}},
  {type: 'MENU', name: 'Settings > Trigger', uniqueName: '/pages/settings', additional: {tab: 'trigger', tabIndex: 8}},
  // { type: 'MENU', name: 'Contact', uniqueName: '/pages/contact' },
  {type: 'MENU', name: 'Inventory In/Out', uniqueName: '/pages/inventory-in-out'},
  {type: 'MENU', name: 'Import', uniqueName: '/pages/import'},
  {type: 'MENU', name: 'Settings > Group', uniqueName: '/pages/settings', additional: {tab: 'Group', tabIndex: 10}},
  {type: 'MENU', name: 'Onboarding', uniqueName: '/onboarding'},
  {type: 'MENU', name: 'Purchase Invoice ', uniqueName: '/pages/purchase/create'},
  {type: 'MENU', name: 'Company Import/Export', uniqueName: '/pages/company-import-export'},
  {type: 'MENU', name: 'New V/S Old Invoices', uniqueName: '/pages/new-vs-old-invoices'},
  {type: 'MENU', name: 'GST', uniqueName: '/pages/gstfiling'},
  // { type: 'MENU', name: 'Aging Report', uniqueName: '/pages/aging-report'},
  {type: 'MENU', name: 'Customer', uniqueName: '/pages/contact/customer', additional: {tab: 'customer', tabIndex: 0}},
  {type: 'MENU', name: 'Vendor', uniqueName: '/pages/contact/vendor', additional: {tab: 'vendor', tabIndex: 1}},
  {type: 'MENU', name: 'Aging Report', uniqueName: '/pages/contact/customer', additional: {tab: 'aging-report', tabIndex: 1}},
  {type: 'MENU', name: 'User-Details > Profile', uniqueName: '/pages/user-details', additional: {tab: 'profile', tabIndex: 1}},
  {type: 'MENU', name: 'User-Details > Api', uniqueName: '/pages/user-details', additional: {tab: 'api', tabIndex: 0}}
];
const HIDE_NAVIGATION_BAR_FOR_LG_ROUTES = ['accounting-voucher', 'inventory',
  'invoice/preview/sales', 'home', 'gstfiling', 'inventory-in-out',
  'ledger'];
const DEFAULT_MENUS = [
  {type: 'MENU', name: 'Customer', uniqueName: '/pages/contact/customer', additional: {tab: 'customer', tabIndex: 0}},
  {type: 'MENU', name: 'Vendor', uniqueName: '/pages/contact/vendor', additional: {tab: 'vendor', tabIndex: 1}},
  {type: 'MENU', name: 'GST', uniqueName: '/pages/gstfiling'},
  {type: 'MENU', name: 'Import', uniqueName: '/pages/import'},
  {type: 'MENU', name: 'Inventory', uniqueName: '/pages/inventory'},
  {type: 'MENU', name: 'Journal Voucher', uniqueName: '/pages/accounting-voucher'},
  {type: 'MENU', name: 'Purchase Invoice ', uniqueName: '/pages/purchase/create'},
  {type: 'MENU', name: 'Sales', uniqueName: '/pages/sales'},
  {type: 'MENU', name: 'Invoice', uniqueName: '/pages/invoice/preview/sales'},
  {type: 'MENU', name: 'Manufacturing', uniqueName: '/pages/manufacturing/report'}
];
const DEFAULT_AC = [
  {type: 'ACCOUNT', name: 'Cash', uniqueName: 'cash'},
  {type: 'ACCOUNT', name: 'Sales', uniqueName: 'sales'},
  {type: 'ACCOUNT', name: 'Purchase', uniqueName: 'purchases'},
  {type: 'ACCOUNT', name: 'General Reserves', uniqueName: 'generalreserves'},
  {type: 'ACCOUNT', name: 'Reverse Charge ', uniqueName: 'reversecharge'},

];
// const DEFAULT_MENUS = ['/pages/contact?tab=customer', '/pages/contact?tab=vendor', '/pages/gstfiling', '/pages/import', '/pages/inventory', '/pages/accounting-voucher',  '/pages/purchase/create', '/pages/sales', '/pages/invoice/preview/sales', 'pages/manufacturing/report'];
const DEFAULT_GROUPS = ['sundrydebtors', 'sundrycreditors', 'bankaccounts'];

// const DEFAULT_AC = ['cash', 'sales', 'purchases', 'generalreserves', 'reversecharge'];
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, AfterViewInit, OnDestroy, AfterViewChecked {
  public userIsSuperUser: boolean = true; // Protect permission module
  public session$: Observable<userLoginStateEnum>;
  public accountSearchValue: string = '';
  public accountSearchControl: FormControl = new FormControl();
  public companyDomains: string[] = ['walkover.in', 'giddh.com', 'muneem.co', 'msg91.com'];
  public moment = moment;
  public imgPath: string = '';
  public isLedgerAccSelected: boolean = false;

  @Output() public menuStateChange: EventEmitter<boolean> = new EventEmitter();

  @ViewChild('companyadd') public companyadd: ElementViewContainerRef;
  @ViewChild('companynewadd') public companynewadd: ElementViewContainerRef;
  // @ViewChildren(ElementViewContainerRef) public test: ElementViewContainerRef;

  @ViewChild('addmanage') public addmanage: ElementViewContainerRef;
  @ViewChild('manageGroupsAccountsModal') public manageGroupsAccountsModal: ModalDirective;
  @ViewChild('addCompanyModal') public addCompanyModal: ModalDirective;
  @ViewChild('addCompanyNewModal') public addCompanyNewModal: ModalDirective;

  @ViewChild('deleteCompanyModal') public deleteCompanyModal: ModalDirective;
  @ViewChild('navigationModal') public navigationModal: TemplateRef<any>; // CMD + K
  @ViewChild('dateRangePickerCmp') public dateRangePickerCmp: ElementRef;
  @ViewChild('dropdown') public companyDropdown: BsDropdownDirective;
  @ViewChild('talkSalesModal') public talkSalesModal: ModalDirective;
  @ViewChild('supportTab') public supportTab: TabsetComponent;
  @ViewChild('searchCmpTextBox') public searchCmpTextBox: ElementRef;

  public title: Observable<string>;
  public flyAccounts: ReplaySubject<boolean> = new ReplaySubject<boolean>();
  public noGroups: boolean;
  public languages: any[] = [
    {name: 'ENGLISH', value: 'en'},
    {name: 'DUTCH', value: 'nl'}
  ];
  public activeFinancialYear: ActiveFinancialYear;
  public datePickerOptions: any = {
    hideOnEsc: true,
    opens: 'left',
    locale: {
      applyClass: 'btn-green',
      applyLabel: 'Go',
      fromLabel: 'From',
      format: 'D-MMM-YY',
      toLabel: 'To',
      cancelLabel: 'Cancel',
      customRangeLabel: 'Custom range'
    },
    ranges: {
      'This Month to Date': [
        moment().startOf('month'),
        moment()
      ],
      'This Quarter to Date': [
        moment().quarter(moment().quarter()).startOf('quarter'),
        moment()
      ],
      'This Financial Year to Date': [
        moment().startOf('year').subtract(9, 'year'),
        moment()
      ],
      'This Year to Date': [
        moment().startOf('year'),
        moment()
      ],
      'Last Month': [
        moment().subtract(1, 'month').startOf('month'),
        moment().subtract(1, 'month').endOf('month')
      ],
      'Last Quarter': [
        moment().quarter(moment().quarter()).subtract(1, 'quarter').startOf('quarter'),
        moment().quarter(moment().quarter()).subtract(1, 'quarter').endOf('quarter')
      ],
      'Last Financial Year': [
        moment().startOf('year').subtract(10, 'year'),
        moment().endOf('year').subtract(10, 'year')
      ],
      'Last Year': [
        moment().subtract(1, 'year').startOf('year'),
        moment().subtract(1, 'year').endOf('year')
      ]
    },
    startDate: moment().subtract(30, 'days'),
    endDate: moment()
  };
  public sideMenu: { isopen: boolean } = {isopen: false};
  public companyMenu: { isopen: boolean } = {isopen: false};
  public isCompanyRefreshInProcess$: Observable<boolean>;
  public isCompanyCreationSuccess$: Observable<boolean>;
  public isLoggedInWithSocialAccount$: Observable<boolean>;
  public isAddAndManageOpenedFromOutside$: Observable<boolean>;
  public companies$: Observable<CompanyResponse[]>;
  public selectedCompany: Observable<CompanyResponse>;
  public seletedCompanywithBranch: string = '';
  public selectedCompanyCountry: string;
  public markForDeleteCompany: CompanyResponse;
  public deleteCompanyBody: string;
  public user$: Observable<UserDetails>;
  public userIsCompanyUser: boolean = false;
  public userName: string;
  public userEmail: string;
  public isElectron: boolean = isElectron;
  public isTodaysDateSelected: boolean = false;
  public isDateRangeSelected: boolean = false;
  public userFullName: string;
  public userAvatar: string;
  public navigationModalVisible: boolean = false;
  public apkVersion: string;
  public menuItemsFromIndexDB: any[] = DEFAULT_MENUS;
  public accountItemsFromIndexDB: any[] = DEFAULT_AC;
  public selectedPage: any = '';
  public selectedLedgerName: string;
  public companyList: CompanyResponse[] = [];
  public searchCmp: string = '';
  public loadAPI: Promise<any>;
  public hoveredIndx: number;
  public activeAccount$: Observable<AccountResponse>;
  public navigationEnd: boolean = true;
  public oldSelectedPage: string = '';
  public navigateToUser: boolean = false;
  public showOtherMenu: boolean = false;
  public showOtherheaderMenu: boolean = false;
  public isLargeWindow: boolean = false;
  public isCompanyProifleUpdate$: Observable<boolean> = observableOf(false);
  private loggedInUserEmail: string;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  private subscriptions: Subscription[] = [];
  private modelRef: BsModalRef;
  private activeCompanyForDb: ICompAidata;
  private indexDBReCreationDate: string = '10-12-2018';
  private smartCombinedList$: Observable<any>;

  /**
   *
   */
  // tslint:disable-next-line:no-empty
  constructor(
    private loginAction: LoginActions,
    private socialAuthService: AuthService,
    private store: Store<AppState>,
    private companyActions: CompanyActions,
    private groupWithAccountsAction: GroupWithAccountsAction,
    private router: Router,
    private flyAccountActions: FlyAccountsActions,
    private componentFactoryResolver: ComponentFactoryResolver,
    private cdRef: ChangeDetectorRef,
    private zone: NgZone,
    private route: ActivatedRoute,
    private _generalActions: GeneralActions,
    private authService: AuthenticationService,
    private _dbService: DbService,
    private modalService: BsModalService,
    private changeDetection: ChangeDetectorRef,
    private _windowRef: WindowRef,
    private _breakpointObserver: BreakpointObserver,
    private _generalService: GeneralService
  ) {

    this._windowRef.nativeWindow.superformIds = ['Jkvq'];

    // Reset old stored application date
    this.store.dispatch(this.companyActions.ResetApplicationDate());

    this.isLoggedInWithSocialAccount$ = this.store.select(p => p.login.isLoggedInWithSocialAccount).pipe(takeUntil(this.destroyed$));

    this.user$ = this.store.select(createSelector([(state: AppState) => state.session.user], (user) => {
      if (user) {
        this.loggedInUserEmail = user.user.email;
        return user.user;
      }
    })).pipe(takeUntil(this.destroyed$));

    this.isCompanyRefreshInProcess$ = this.store.select(state => state.session.isRefreshing).pipe(takeUntil(this.destroyed$));
    this.activeAccount$ = this.store.select(p => p.ledger.account).pipe(takeUntil(this.destroyed$));

    this.isCompanyCreationSuccess$ = this.store.select(p => p.session.isCompanyCreationSuccess).pipe(takeUntil(this.destroyed$));
    this.isCompanyProifleUpdate$ = this.store.select(p => p.settings.updateProfileSuccess).pipe(takeUntil(this.destroyed$));

    this.selectedCompany = this.store.select(createSelector([(state: AppState) => state.session.companies, (state: AppState) => state.session.companyUniqueName], (companies, uniqueName) => {
      if (!companies) {
        return;
      }

      let orderedCompanies = _.orderBy(companies, 'name');
      this.companies$ = observableOf(orderedCompanies);
      this.companyList = orderedCompanies;

      let selectedCmp = companies.find(cmp => {
        if (cmp && cmp.uniqueName) {
          return cmp.uniqueName === uniqueName;
        } else {
          return false;
        }
      });
      if (!selectedCmp) {
        return;
      }

      // Sagar told to change the logic
      // if (selectedCmp.createdBy.email === this.loggedInUserEmail) {
      //   this.userIsSuperUser = true;
      // } else {
      //   this.userIsSuperUser = false;
      // }
      // new logic
      // if (selectedCmp.userEntityRoles && selectedCmp.userEntityRoles.length && (selectedCmp.userEntityRoles.findIndex((entity) => entity.role.uniqueName === 'super_admin') === -1)) {
      //   this.userIsSuperUser = false;
      // } else {
      //   this.userIsSuperUser = true;
      // }
      if (selectedCmp) {
        this.activeFinancialYear = selectedCmp.activeFinancialYear;
        this.store.dispatch(this.companyActions.setActiveFinancialYear(this.activeFinancialYear));
        if (selectedCmp.nameAlias) {
          this.seletedCompanywithBranch = selectedCmp.name + ' (' + selectedCmp.nameAlias + ')';
        } else {
          this.seletedCompanywithBranch = selectedCmp.name;
        }

        if (this.activeFinancialYear) {
          this.datePickerOptions.ranges['This Financial Year to Date'] = [
            moment(this.activeFinancialYear.financialYearStarts, 'DD-MM-YYYY').startOf('day'),
            moment()
          ];
          this.datePickerOptions.ranges['Last Financial Year'] = [
            moment(this.activeFinancialYear.financialYearStarts, 'DD-MM-YYYY').subtract(1, 'year'),
            moment(this.activeFinancialYear.financialYearEnds, 'DD-MM-YYYY').subtract(1, 'year')
          ];
        }

        this.activeCompanyForDb = new CompAidataModel();
        this.activeCompanyForDb.name = selectedCmp.name;
        this.activeCompanyForDb.uniqueName = selectedCmp.uniqueName;
      }

      this.selectedCompanyCountry = selectedCmp.country;
      return selectedCmp;
    })).pipe(takeUntil(this.destroyed$));

    this.session$ = this.store.select(p => p.session.userLoginState).pipe(distinctUntilChanged(), takeUntil(this.destroyed$));

    // this is not needed because we are already refreshing compnies array when we update company profile
    // this.isCompanyProifleUpdate$.subscribe(a => {
    //   if (a) {
    //     this.selectedCompany = this.store.select(p => p.settings.profile).pipe(take(1));
    //     // this.branchUniqueName = this.store.select(p => console).pipe(take(1));
    //   }
    // });

    this.isAddAndManageOpenedFromOutside$ = this.store.select(s => s.groupwithaccounts.isAddAndManageOpenedFromOutside).pipe(takeUntil(this.destroyed$));
    this.smartCombinedList$ = this.store.pipe(select(s => s.general.smartCombinedList), takeUntil(this.destroyed$));

  }

  public ngOnInit() {
    this.sideBarStateChange(true);
    this.getElectronAppVersion();
    this.store.dispatch(this.companyActions.GetApplicationDate());

    this.user$.pipe(take(1)).subscribe((u) => {
      if (u) {
        let userEmail = u.email;
        this.userEmail = _.clone(userEmail);
        // this.getUserAvatar(userEmail);
        let userEmailDomain = userEmail.replace(/.*@/, '');
        this.userIsCompanyUser = userEmailDomain && this.companyDomains.indexOf(userEmailDomain) !== -1;
        let name = u.name;
        if (u.name.match(/\s/g)) {
          this.userFullName = name;
          let tmpName = name.split(' ');
          this.userName = tmpName[0][0] + tmpName[1][0];
        } else {
          this.userName = u.name[0] + u.name[1];
          this.userFullName = name;
        }

        this.store.dispatch(this.loginAction.renewSession());
      }
    });

    this.manageGroupsAccountsModal.onHidden.subscribe(e => {
      this.store.dispatch(this.groupWithAccountsAction.resetAddAndMangePopup());
    });

    this.accountSearchControl.valueChanges.pipe(
      debounceTime(300))
      .subscribe((newValue) => {
        this.accountSearchValue = newValue;
        if (newValue.length > 0) {
          this.noGroups = true;
        }
        this.filterAccounts(newValue);
      });

    this.store.select(p => p.session.companyUniqueName).pipe(distinctUntilChanged(), takeUntil(this.destroyed$)).subscribe(a => {
      if (a && a !== '') {
        this.zone.run(() => {
          this.filterAccounts('');
        });
      }
    });

    // region creating list for cmd+g modal
    combineLatest(
      this.store.select(p => p.general.flattenGroups).pipe(takeUntil(this.destroyed$)),
      this.store.select(p => p.general.flattenAccounts).pipe(takeUntil(this.destroyed$))
    )
      .subscribe((resp: any[]) => {
        let menuList = cloneDeep(NAVIGATION_ITEM_LIST);
        let grpList = cloneDeep(resp[0]);
        let acList = cloneDeep(resp[1]);
        let combinedList;
        if (grpList && grpList.length && acList && acList.length) {

          // sort menus by name
          menuList = sortBy(menuList, ['name']);

          // modifying grouplist as per ulist requirement
          grpList.map((item: any) => {
            item.type = 'GROUP';
            item.name = item.groupName || item.name;
            item.uniqueName = item.groupUniqueName || item.uniqueName;
            delete item.groupName;
            delete item.groupUniqueName;
            return item;
          });

          // sort group list by name
          grpList = sortBy(grpList, ['name']);
          // sort group list by name
          acList = sortBy(acList, ['name']);

          combinedList = concat(menuList, grpList, acList);
          this.store.dispatch(this._generalActions.setCombinedList(combinedList));
        }
      });
    // endregion

    // region subscribe to last state for showing title of page this.selectedPage
    this.store.select(c => c.session.lastState).pipe(take(1)).subscribe((s: string) => {
      this.isLedgerAccSelected = false;
      const lastState = s.toLowerCase();
      const lastStateName = NAVIGATION_ITEM_LIST.find((page) => page.uniqueName.substring(7, page.uniqueName.length).startsWith(lastState));
      if (lastStateName) {
        return this.selectedPage = lastStateName.name;
      } else if (lastState.includes('ledger/')) {

        this.activeAccount$.subscribe(acc => {
          if (acc) {
            this.isLedgerAccSelected = true;
            this.selectedLedgerName = lastState.substr(lastState.indexOf('/') + 1);
            this.selectedPage = 'ledger - ' + acc.name;
            return this.navigateToUser = false;

          }
        });
      } else if (this.selectedPage === 'gst') {
        this.selectedPage = 'GST';
      }
    });
    // endregion

    this.imgPath = isElectron ? 'assets/images/' : AppUrl + APP_FOLDER + 'assets/images/';

    this.router.events.subscribe(a => {
      if (a instanceof NavigationStart) {
        this.navigationEnd = false;
      }
      if (a instanceof NavigationEnd || a instanceof RouteConfigLoadEnd) {
        this.navigationEnd = true;
        if (a instanceof NavigationEnd) {
          this.adjustNavigationBar();
        }
      }
    });

    this.loadAPI = new Promise((resolve) => {
      this.loadScript();
      resolve(true);
    });

    this._generalService.talkToSalesModal.subscribe(a => {
      if (a) {
        this.openScheduleModal();
      }
    });
    // Observes when screen resolution is 1440 or less close navigation bar for few pages...
    this._breakpointObserver
      .observe(['(max-width: 1440px)'])
      .subscribe((state: BreakpointState) => {
        this.isLargeWindow = state.matches;
        this.adjustNavigationBar();
      });

    this.isAddAndManageOpenedFromOutside$.subscribe(s => {
      if (s) {
        this.loadAddManageComponent();
        this.manageGroupsAccountsModal.show();
      }
    });

    // initial data binding for universal modal and for menu
    this.smartCombinedList$.subscribe(smartList => {
      if (smartList && smartList.length) {
        if (this.activeCompanyForDb && this.activeCompanyForDb.uniqueName) {
          this._dbService.getItemDetails(this.activeCompanyForDb.uniqueName).toPromise().then(dbResult => {
            this.findListFromDb(dbResult);
          });
        }
      }
    });
  }

  public ngAfterViewInit() {
    this.session$.subscribe((s) => {
      if (s === userLoginStateEnum.notLoggedIn) {
        this.router.navigate(['/login']);
      } else if (s === userLoginStateEnum.newUserLoggedIn) {
        // this.router.navigate(['/pages/dummy'], { skipLocationChange: true }).then(() => {
        this.router.navigate(['/new-user']);
        // });
      } else {
        // get groups with accounts for general use
        this.store.dispatch(this._generalActions.getGroupWithAccounts());
        this.store.dispatch(this._generalActions.getAllState());
        this.store.dispatch(this._generalActions.getFlattenAccount());
        this.store.dispatch(this._generalActions.getFlattenGroupsReq());
      }
    });
    if (this.route.snapshot.url.toString() === 'new-user') {
      this.showAddCompanyModal();
    }
    this.store.dispatch(this.loginAction.FetchUserDetails());

    // Get universal date
    this.store.select(createSelector([(state: AppState) => state.session.applicationDate], (dateObj: Date[]) => {
      if (dateObj && dateObj.length) {
        if (!this.isDateRangeSelected) {
          this.datePickerOptions.startDate = moment(dateObj[0]);
          this.datePickerOptions.endDate = moment(dateObj[1]);
          this.isDateRangeSelected = true;
          const from: any = moment().subtract(30, 'days').format(GIDDH_DATE_FORMAT);
          const to: any = moment().format(GIDDH_DATE_FORMAT);
          const fromFromStore = moment(dateObj[0]).format(GIDDH_DATE_FORMAT);
          const toFromStore = moment(dateObj[1]).format(GIDDH_DATE_FORMAT);

          if (from === fromFromStore && to === toFromStore) {
            this.isTodaysDateSelected = true;
          }
        }
        let fromForDisplay = moment(dateObj[0]).format('D-MMM-YY');
        let toForDisplay = moment(dateObj[1]).format('D-MMM-YY');
        if (this.dateRangePickerCmp) {
          this.dateRangePickerCmp.nativeElement.value = `${fromForDisplay} - ${toForDisplay}`;
        }
      }
    })).subscribe();
  }

  public ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  public vendorOrCustomer(path: string) {
    this.selectedPage = path === 'customer' ? 'Customer' : 'Vendor';
  }

  public handleNoResultFoundEmitter(e: any) {
    this.store.dispatch(this._generalActions.getFlattenAccount());
    this.store.dispatch(this._generalActions.getFlattenGroupsReq());
  }

  public handleNewTeamCreationEmitter(e: any) {
    this.modelRef.hide();
    this.showManageGroupsModal();
  }

  /**
   * redirect to route and save page entry into db
   * @param e event
   * @param pageName page router url
   * @param queryParamsObj additional data
   */
  public analyzeMenus(e: any, pageName: string, queryParamsObj?: any) {
    this.oldSelectedPage = _.cloneDeep(this.selectedPage);
    this.isLedgerAccSelected = false;
    if (e) {
      if (e.shiftKey || e.ctrlKey || e.metaKey) { // if user pressing combination of shift+click, ctrl+click or cmd+click(mac)
        return;
      }
      e.preventDefault();
      e.stopPropagation();
    }
    this.companyDropdown.isOpen = false;

    // entry in db with confirmation
    let menu: any = {};
    menu.time = +new Date();

    let o: IUlist = _.find(NAVIGATION_ITEM_LIST, (item) => {
      if (queryParamsObj) {
        if (item.additional) {
          return item.uniqueName === pageName && item.additional.tabIndex === queryParamsObj.tabIndex;
        }
      } else {
        return item.uniqueName === pageName;
      }
    });
    if (o) {
      menu = {...menu, ...o};
    } else {
      try {
        menu.name = pageName.split('/pages/')[1].toLowerCase();
        if (!menu.name) {
          menu.name = pageName.split('/')[1].toLowerCase();
        }
      } catch (error) {
        menu.name = pageName.toLowerCase();
      }
      menu.name = this.getReadableNameFromUrl(menu.name);
      menu.uniqueName = pageName.toLowerCase();
      menu.type = 'MENU';

      if (queryParamsObj) {
        menu.additional = queryParamsObj;
      }
    }
    this.doEntryInDb('menus', menu);

    if (menu.additional) {
      this.router.navigate([pageName], {queryParams: menu.additional});
    } else {
      this.router.navigate([pageName]);
    }
  }

  public analyzeOtherMenus(name: string, additional: any = null) {
    name = `/pages/${name}`;
    this.analyzeMenus(null, name, additional);
  }

  public analyzeAccounts(e: any, acc) {
    if (e.shiftKey || e.ctrlKey || e.metaKey) { // if user pressing combination of shift+click, ctrl+click or cmd+click(mac)
      this.onItemSelected(acc);
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    this.onItemSelected(acc);
  }

  public prepareSmartList(data: IUlist[]) {
    // hardcoded aiData
    // '/pages/trial-balance-and-profit-loss'
    let menuList: IUlist[] = [];
    let groupList: IUlist[] = [];
    let acList: IUlist[] = [];
    let defaultGrp = _.cloneDeep(_.map(DEFAULT_GROUPS, (o: any) => o.uniqueName));
    let defaultAcc = _.cloneDeep(_.map(DEFAULT_AC, (o: any) => o.uniqueName));
    let defaultMenu = _.cloneDeep(DEFAULT_MENUS);

    // parse and push default menu to menulist for sidebar menu for initial usage
    defaultMenu.forEach(item => {
      let newItem: IUlist = {
        name: item.name,
        uniqueName: item.uniqueName,
        additional: item.additional,
        type: 'MENU',
        time: +new Date()
      };
      menuList.push(newItem);
    });
    data.forEach((item: IUlist) => {

      // if (item.type === 'MENU') {
      //   // if (defaultMenu.indexOf(item.uniqueName) !== -1) {
      //   //     item.time = +new Date();
      //   //     menuList.push(item);
      //   // }
      // }

      if (item.type === 'GROUP') {
        if (defaultGrp.indexOf(item.uniqueName) !== -1) {
          item.time = +new Date();
          groupList.push(item);
        }
      } else {
        if (defaultAcc.indexOf(item.uniqueName) !== -1) {
          item.time = +new Date();
          acList.push(item);
        }
      }

    });
    let combined = cloneDeep([...menuList, ...groupList, ...acList]);
    this.store.dispatch(this._generalActions.setSmartList(combined));
    this.activeCompanyForDb.aidata = {
      menus: menuList,
      groups: groupList,
      accounts: acList
    };

    // due to some issue
    // this.selectedPage = menuList[0].name;
    debugger;
    this._dbService.insertFreshData(this.activeCompanyForDb);
  }

  public findListFromDb(dbResult: ICompAidata) {
    if (!this.activeCompanyForDb) {
      return;
    }
    if (!this.activeCompanyForDb.uniqueName) {
      return;
    }

    if (dbResult) {

      let dbRecreatedAt = localStorage.getItem('db_recreated_at');
      if (!dbRecreatedAt || (dbRecreatedAt && Number(dbRecreatedAt) < moment(this.indexDBReCreationDate, 'DD-MM-YYYY').valueOf())) {
        // need to delete indexDB, since it is older than out date
        this._dbService.deleteAllData();
        localStorage.setItem('db_recreated_at', `${moment().valueOf()}`);
        return location.reload(true);
      }

      // this.selectedPage = dbResult.aidata.menus[0].name;

      this.menuItemsFromIndexDB = _.uniqBy(dbResult.aidata.menus, o => {
        if (o.additional) {
          return o.additional.tabIndex;
        } else {
          return o.uniqueName;
        }
      });

      if (window.innerWidth > 1440 && window.innerHeight > 717) {
        this.menuItemsFromIndexDB = _.slice(this.menuItemsFromIndexDB, 0, 10);
        this.accountItemsFromIndexDB = _.slice(dbResult.aidata.accounts, 0, 7);
      } else {
        this.menuItemsFromIndexDB = _.slice(this.menuItemsFromIndexDB, 0, 10);
        this.accountItemsFromIndexDB = _.slice(dbResult.aidata.accounts, 0, 5);
      }

      let combined = this._dbService.extractDataForUI(dbResult.aidata);
      this.store.dispatch(this._generalActions.setSmartList(combined));
    } else {
      let data: IUlist[];
      this.smartCombinedList$.pipe(take(1)).subscribe(listResult => {
        data = listResult;
      });
      // make entry with smart list data
      this.prepareSmartList(data);
    }
  }

  public showManageGroupsModal() {
    this.store.dispatch(this.groupWithAccountsAction.getGroupWithAccounts(''));
    this.loadAddManageComponent();
    this.manageGroupsAccountsModal.show();
  }

  public hideManageGroupsModal() {
    this.store.select(c => c.session.lastState).pipe(take(1)).subscribe((s: string) => {
      if (s && (s.indexOf('ledger/') > -1 || s.indexOf('settings') > -1)) {
        this.store.dispatch(this._generalActions.addAndManageClosed());
      }
    });

    this.manageGroupsAccountsModal.hide();
  }

  public showAddCompanyModal() {
    this.loadAddCompanyNewUiComponent();
    this.addCompanyNewModal.show();
  }

  public hideAddCompanyModal() {
    this.addCompanyNewModal.hide();
  }

  public hideCompanyModalAndShowAddAndManage() {
    this.addCompanyModal.hide();
    this.store.dispatch(this.groupWithAccountsAction.getGroupWithAccounts(''));
    this.manageGroupsAccountsModal.show();
  }

  public refreshCompanies(e: Event) {
    e.stopPropagation();
    e.preventDefault();
    this.store.dispatch(this.companyActions.RefreshCompanies());
  }

  public changeCompany(selectedCompanyUniqueName: string) {
    this.store.dispatch(this.loginAction.ChangeCompany(selectedCompanyUniqueName));
  }

  public deleteCompany(e: Event) {
    e.stopPropagation();
    this.store.dispatch(this.companyActions.DeleteCompany(this.markForDeleteCompany.uniqueName));
    this.hideDeleteCompanyModal(e);
  }

  public showDeleteCompanyModal(company: CompanyResponse, e: Event) {
    this.markForDeleteCompany = company;
    this.deleteCompanyBody = `Are You Sure You Want To Delete ${company.name} ? `;
    this.deleteCompanyModal.show();
    e.stopPropagation();
  }

  public hideDeleteCompanyModal(e: Event) {
    e.stopPropagation();
    this.deleteCompanyModal.hide();
  }

  public logout() {
    if (isElectron) {
      // this._aunthenticationServer.GoogleProvider.signOut();
      this.store.dispatch(this.loginAction.ClearSession());
    } else {
      // check if logged in via social accounts
      this.isLoggedInWithSocialAccount$.subscribe((val) => {
        if (val) {
          this.socialAuthService.signOut().then(() => {
            this.store.dispatch(this.loginAction.ClearSession());
            this.store.dispatch(this.loginAction.socialLogoutAttempt());
          }).catch((err) => {
            this.store.dispatch(this.loginAction.ClearSession());
            this.store.dispatch(this.loginAction.socialLogoutAttempt());
          });

        } else {
          this.store.dispatch(this.loginAction.ClearSession());
        }
      });

    }
  }

  public onHide() {
    this.store.dispatch(this.companyActions.ResetCompanyPopup());
  }

  public onShown() {
    //
  }

  public loadAddCompanyNewUiComponent() {
    let componentFactory = this.componentFactoryResolver.resolveComponentFactory(CompanyAddNewUiComponent);
    let viewContainerRef = this.companynewadd.viewContainerRef;
    viewContainerRef.clear();
    let componentRef = viewContainerRef.createComponent(componentFactory);
    (componentRef.instance as CompanyAddNewUiComponent).closeCompanyModal.subscribe((a) => {
      this.hideAddCompanyModal();
    });
    (componentRef.instance as CompanyAddNewUiComponent).closeCompanyModalAndShowAddManege.subscribe((a) => {
      this.hideCompanyModalAndShowAddAndManage();
    });
  }

  public loadAddManageComponent() {
    let componentFactory = this.componentFactoryResolver.resolveComponentFactory(ManageGroupsAccountsComponent);
    let viewContainerRef = this.addmanage.viewContainerRef;
    viewContainerRef.clear();
    let componentRef = viewContainerRef.createComponent(componentFactory);
    (componentRef.instance as ManageGroupsAccountsComponent).closeEvent.subscribe((a) => {
      this.hideManageGroupsModal();
      viewContainerRef.remove();
    });
    this.manageGroupsAccountsModal.onShown.subscribe((a => {
      (componentRef.instance as ManageGroupsAccountsComponent).headerRect = (componentRef.instance as ManageGroupsAccountsComponent).header.nativeElement.getBoundingClientRect();
      (componentRef.instance as ManageGroupsAccountsComponent).myModelRect = (componentRef.instance as ManageGroupsAccountsComponent).myModel.nativeElement.getBoundingClientRect();
    }));
  }

  public filterAccounts(q: string) {
    this.store.dispatch(this.flyAccountActions.GetflatAccountWGroups(q));
  }

  public sideBarStateChange(event: boolean) {
    this.sideMenu.isopen = event;
    this.companyDropdown.isOpen = false;
    this.menuStateChange.emit(event);
  }

  public forceCloseSidebar(event) {
    if (event.target.parentElement.classList.contains('wrapAcList')) {
      return;
    }
    this.flyAccounts.next(false);
  }

  public closeSidebar(targetId) {
    if (targetId === 'accountSearch' || targetId === 'expandAllGroups' || targetId === 'toggleAccounts') {
      return;
    }
    this.flyAccounts.next(false);
  }

  public setApplicationDate(ev) {
    let data = ev ? _.cloneDeep(ev) : null;
    if (data && data.picker) {
      let dates = {
        fromDate: moment(data.picker.startDate._d).format(GIDDH_DATE_FORMAT),
        toDate: moment(data.picker.endDate._d).format(GIDDH_DATE_FORMAT)
      };
      // if (data.picker.chosenLabel === 'This Financial Year to Date') {
      //   data.picker.startDate = moment(_.clone(this.activeFinancialYear.financialYearStarts), 'DD-MM-YYYY').startOf('day');
      //   dates.fromDate = moment(data.picker.startDate._d).format(GIDDH_DATE_FORMAT);
      // }
      // if (data.picker.chosenLabel === 'Last Financial Year') {
      //   data.picker.startDate = moment(this.activeFinancialYear.financialYearStarts, 'DD-MM-YYYY').subtract(1, 'year');
      //   data.picker.endDate = moment(this.activeFinancialYear.financialYearEnds, 'DD-MM-YYYY').subtract(1, 'year');
      //   dates.fromDate = moment(data.picker.startDate._d).format(GIDDH_DATE_FORMAT);
      //   dates.toDate = moment(data.picker.endDate._d).format(GIDDH_DATE_FORMAT);
      // }
      this.isTodaysDateSelected = false;
      this.store.dispatch(this.companyActions.SetApplicationDate(dates));
    } else {
      this.isTodaysDateSelected = true;
      let today = _.cloneDeep([moment(), moment()]);
      this.datePickerOptions.startDate = today[0];
      this.datePickerOptions.endDate = today[1];
      let dates = {
        fromDate: null,
        toDate: null,
        duration: null,
        period: null,
        noOfTransactions: null
      };
      this.store.dispatch(this.companyActions.SetApplicationDate(dates));
    }
  }

  public openDateRangePicker() {
    this.isTodaysDateSelected = false;
  }

  public jumpToToday() {
    this.setApplicationDate(null);
  }

  public ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  public getUserAvatar(userId) {
    // this.authService.getUserAvatar(userId).subscribe(res => {
    //   let data = res;
    //   this.userAvatar = res.entry.gphoto$thumbnail.$t;
    // });
  }

  // CMD + G functionality
  @HostListener('document:keydown', ['$event'])
  public handleKeyboardUpEvent(event: KeyboardEvent) {
    if ((event.metaKey || event.ctrlKey) && (event.which === 75 || event.which === 71) && !this.navigationModalVisible) {
      event.preventDefault();
      event.stopPropagation();
      this.showNavigationModal();
    }

    // window.addEventListener('keyup', (e: KeyboardEvent) => {
    //   if (e.keyCode === 27) {
    //     if (this.sideMenu.isopen) {
    //       this.sideMenu.isopen = false;
    //     }
    //     if (this.manageGroupsAccountsModal.isShown) {
    //       this.hideManageGroupsModal();
    //     }
    //   }
    // });
  }

  public makeGroupEntryInDB(item: IUlist) {
    // save data to db
    item.time = +new Date();
    this.doEntryInDb('groups', item);
  }

  public onItemSelected(item: IUlist) {
    this.oldSelectedPage = _.cloneDeep(this.selectedPage);
    if (this.modelRef) {
      this.modelRef.hide();
    }

    if (item && item.type === 'MENU') {
      if (item.additional && item.additional.tab) {
        if (item.uniqueName.includes('?')) {
          item.uniqueName = item.uniqueName.split('?')[0];
        }
        this.router.navigate([item.uniqueName], {queryParams: {tab: item.additional.tab, tabIndex: item.additional.tabIndex}});
      } else {
        this.router.navigate([item.uniqueName]);
      }
    } else {
      // direct account scenerio
      let url = `ledger/${item.uniqueName}`;
      // if (!this.isLedgerAccSelected) {
      //   this.navigateToUser = true;
      // }
      this.router.navigate([url]); // added link in routerLink
    }
    // save data to db
    item.time = +new Date();
    let entity = (item.type) ? 'menus' : 'accounts';
    this.doEntryInDb(entity, item);
  }

  public filterCompanyList(ev) {
    let companies: CompanyResponse[] = [];
    this.companies$.pipe(take(1)).subscribe(cmps => companies = cmps);

    this.companyList = companies.filter((cmp) => {
      if (!cmp.nameAlias) {
        return cmp.name.toLowerCase().includes(ev.toLowerCase());
      } else {
        return cmp.name.toLowerCase().includes(ev.toLowerCase()) || cmp.nameAlias.toLowerCase().includes(ev.toLowerCase());
      }
    });
  }

  public closeUserMenu(ev) {
    // if (ev.target && ev.target.classList && !ev.target.classList.contains('cName')) {
    //   this.companyMenu.isopen = false;
    // } else {
    //   this.companyMenu.isopen = true;
    // }
    ev.isopen = false;
    this.companyMenu.isopen = false;
  }

  public openScheduleModal() {
    this.talkSalesModal.show();
  }

  public closeModal() {
    this.talkSalesModal.hide();
    this._generalService.talkToSalesModal.next(false);
  }

  public onRight(nodes) {
    if (nodes.currentVertical) {
      if (!this.isDropdownOpen(nodes.currentVertical)) {
        nodes.currentVertical.click();
      }
    }
  }

  public onLeft(nodes, navigator) {
    navigator.remove();
    if (navigator.currentVertical) {
      if (this.isDropdownOpen(nodes.currentVertical)) {
        navigator.currentVertical.click();
      }
    }
  }

  public isDropdownOpen(node) {
    const attrs = node.attributes;
    return (attrs.getNamedItem('dropdownToggle') && attrs.getNamedItem('switch-company')
      && attrs.getNamedItem('aria-expanded') && attrs.getNamedItem('aria-expanded').nodeValue === 'true');
  }

  public loadScript() {
    let isFound = false;
    let scripts = document.getElementsByTagName('script');
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < scripts.length; ++i) {
      if (scripts[i].getAttribute('src') != null && scripts[i].getAttribute('src').includes('loader')) {
        isFound = true;
      }
    }

    if (!isFound) {
      let dynamicScripts = ['https://random-scripts.herokuapp.com/superform/superform.js'];

      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < dynamicScripts.length; i++) {
        let node = document.createElement('script');
        node.src = dynamicScripts[i];
        node.type = 'text/javascript';
        node.async = false;
        node.charset = 'utf-8';
        document.getElementsByTagName('head')[0].appendChild(node);
      }

    }
  }

  public scheduleNow() {
    let newwindow = window.open('https://app.intercom.io/a/meeting-scheduler/calendar/VEd2SmtLSyt2YisyTUpEYXBCRWg1YXkwQktZWmFwckF6TEtwM3J5Qm00R2dCcE5IWVZyS0JjSXF2L05BZVVWYS0tck81a21EMVZ5Z01SQWFIaG00RlozUT09--c6f3880a4ca63a84887d346889b11b56a82dd98f', 'scheduleWindow', 'height=650,width=1199,left=200,top=100`');
    if (window.focus) {
      newwindow.focus();
    }
    return false;
  }

  public mouseEnteredOnCompanyName(i: number) {
    this.hoveredIndx = i;
  }

  public menuScrollEnd(ev) {
    let offset = $('#other').position();
    if (offset) {
      let exactPosition = offset.top - 60;
      $('#other_sub_menu').css('top', exactPosition);
    }
  }

  public onCompanyShown(sublist, navigator) {
    if (sublist.children[1]) {
      navigator.add(sublist.children[1]);
      navigator.nextVertical();
    }
  }

  public openSubMenu(type: boolean) {
    if (type) {
      this.showOtherheaderMenu = true;
    } else {
      this.showOtherheaderMenu = false;
    }
  }

  public toggleAllmoduleMenu() {
    this.showOtherMenu = !this.showOtherMenu;
  }

  public switchCompanyMenuShown() {
    if (this.searchCmpTextBox && this.searchCmpTextBox.nativeElement) {
      setTimeout(() => this.searchCmpTextBox.nativeElement.focus(), 200);
    }
  }

  private doEntryInDb(entity: string, item: IUlist) {

    if (entity === 'menus') {
      this.selectedPage = item.name;
      this.isLedgerAccSelected = false;
    } else if (entity === 'accounts') {
      this.isLedgerAccSelected = true;
      this.selectedLedgerName = item.uniqueName;
      this.selectedPage = 'ledger - ' + item.name;
    }

    if (this.activeCompanyForDb && this.activeCompanyForDb.uniqueName) {
      this._dbService.addItem(this.activeCompanyForDb.uniqueName, entity, item).then((res) => {
        if (res) {
          this.findListFromDb(res);
        }
      }, (err: any) => {
        console.log('%c Error: %c ' + err + '', 'background: #c00; color: #ccc', 'color: #333');
      });
    }
  }

  private unsubscribe() {
    this.subscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
    this.subscriptions = [];
  }

  private adjustNavigationBar() {

    const hideNav = !(HIDE_NAVIGATION_BAR_FOR_LG_ROUTES.find(p => this.router.url.includes(p)) && this.isLargeWindow);
    this.sideBarStateChange(hideNav);
  }

  private showNavigationModal() {
    this.navigationModalVisible = true;
    const _combine = combineLatest(
      this.modalService.onShow,
      this.modalService.onShown,
      this.modalService.onHide,
      this.modalService.onHidden
    ).subscribe(() => this.changeDetection.markForCheck());

    this.subscriptions.push(
      this.modalService.onShow.subscribe((reason: string) => {
        //
      })
    );
    this.subscriptions.push(
      this.modalService.onShown.subscribe((reason: string) => {
        //
      })
    );
    this.subscriptions.push(
      this.modalService.onHide.subscribe((reason: string) => {
        //
      })
    );
    this.subscriptions.push(
      this.modalService.onHidden.subscribe((reason: string) => {
        this.navigationModalVisible = false;
        this.unsubscribe();
      })
    );

    this.subscriptions.push(_combine);
    let config: ModalOptions = {class: 'universal_modal', show: true, keyboard: true, animated: false};
    this.modelRef = this.modalService.show(this.navigationModal, config);
  }

  private getElectronAppVersion() {
    this.authService.GetElectronAppVersion().subscribe((res: string) => {
      if (res && typeof res === 'string') {
        let version = res.split('files')[0];
        let versNum = version.split(' ')[1];
        this.apkVersion = versNum;
      }
    });
  }

  private getReadableNameFromUrl(url) {
    let name = '';
    switch (url) {
      case 'SETTINGS?TAB=PERMISSION&TABINDEX=5':
        name = 'Settings > Permission';
        break;
      case 'user-details/profile':
        name = 'User Details';
        break;
      case 'inventory-in-out':
        name = 'Inventory In/Out';
        break;
      default:
        name = url;
    }
    return name;
  }

}
