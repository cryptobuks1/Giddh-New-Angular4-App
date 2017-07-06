import { CompanyAddComponent } from './components/company-add/company-add.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs/Rx';
import { Component, OnInit, AfterViewInit, ViewChild, ComponentFactoryResolver } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { ManageGroupsAccountsComponent } from './components/';
import { ModalDirective } from 'ngx-bootstrap';
import { AppState } from '../../store/roots';
import { LoginActions } from '../../services/actions/login.action';
import { CompanyActions } from '../../services/actions/company.actions';
import { ComapnyResponse, StateDetailsResponse, StateDetailsRequest } from '../../models/api-models/Company';
import { UserDetails } from '../../models/api-models/loginModels';
import { GroupWithAccountsAction } from '../../services/actions/groupwithaccounts.actions';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import { ElementViewContainerRef } from '../helpers/directives/element.viewchild.directive';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit, AfterViewInit {

  public session$: Observable<boolean>;
  @ViewChild(ElementViewContainerRef) public elementViewContainerRef: ElementViewContainerRef;
  @ViewChild('manageGroupsAccountsModal') public manageGroupsAccountsModal: ModalDirective;
  @ViewChild('addCompanyModal') public addCompanyModal: ModalDirective;

  @ViewChild('deleteCompanyModal') public deleteCompanyModal: ModalDirective;
  public title: Observable<string>;
  public flyAccounts: Subject<boolean> = new Subject<boolean>();
  public noGroups: boolean;
  public languages: any[] = [
    { name: 'ENGLISH', value: 'en' },
    { name: 'DUTCH', value: 'nl' }
  ];
  public sideMenu: { isopen: boolean } = { isopen: false };
  public userMenu: { isopen: boolean } = { isopen: false };
  public companyMenu: { isopen: boolean } = { isopen: false };
  public isCompanyRefreshInProcess$: Observable<boolean>;
  public companies$: Observable<ComapnyResponse[]>;
  public selectedCompany: Observable<ComapnyResponse>;
  public markForDeleteCompany: ComapnyResponse;
  public deleteCompanyBody: string;
  public user$: Observable<UserDetails>;

  public userName: string;

  /**
   *
   */
  // tslint:disable-next-line:no-empty
  constructor(
    private loginAction: LoginActions,
    private store: Store<AppState>,
    private companyActions: CompanyActions,
    private groupWithAccountsAction: GroupWithAccountsAction,
    private router: Router,
    private componentFactoryResolver: ComponentFactoryResolver
  ) {
    this.user$ = this.store.select(state => {
      if (state.session.user) {
        return state.session.user.user;
      }
    });

    this.isCompanyRefreshInProcess$ = this.store.select(state => {
      return state.company.isRefreshing;
    });

    this.companies$ = this.store.select(state => {
      return _.orderBy(state.company.companies, 'name');
    });

    this.selectedCompany = this.store.select(state => {
      if (!state.company.companies) {
        return;
      }
      return state.company.companies.find(cmp => {
        return cmp.uniqueName === state.session.companyUniqueName;
      });
    });
    this.session$ = this.store.select(p => (p.session.user !== null && p.session.user.user !== null && p.session.user.authKey !== null));
  }
  // tslint:disable-next-line:no-empty
  public ngOnInit() {
    console.log('header');
    this.store.dispatch(this.loginAction.LoginSuccess());
    this.user$.subscribe((u) => {
      if (u) {
        if (u.name.match(/\s/g)) {
          let name = u.name;
          let tmpName = name.split(' ');
          this.userName = tmpName[0][0] + tmpName[1][0];
        } else {
          this.userName = u.name[0] + u.name[1];
        }
      }
    });

    this.manageGroupsAccountsModal.onHidden.subscribe(e => {
      this.store.dispatch(this.groupWithAccountsAction.resetAddAndMangePopup());
    });
  }
  // tslint:disable-next-line:no-empty
  public ngAfterViewInit() {
    this.session$.subscribe((s) => {
      if (!s) {
        this.router.navigate(['/login']);
      }
    });
  }

  public showManageGroupsModal() {
    this.store.dispatch(this.groupWithAccountsAction.getGroupWithAccounts(''));
    this.manageGroupsAccountsModal.show();
  }

  public hideManageGroupsModal() {
    this.manageGroupsAccountsModal.hide();
  }

  public showAddCompanyModal() {
    this.loadAddCompanyComponent();
    this.addCompanyModal.show();
  }

  public hideAddCompanyModal() {
    this.addCompanyModal.hide();
  }

  public hideCompanyModalAndShowAddAndManage() {
    this.addCompanyModal.hide();
    this.store.dispatch(this.groupWithAccountsAction.getGroupWithAccounts(''));
    this.manageGroupsAccountsModal.show();
  }

  public refreshCompanies(e: Event) {
    this.store.dispatch(this.companyActions.RefreshCompanies());
  }

  public changeCompany(selectedCompanyUniqueName: string) {
    let stateDetailsRequest = new StateDetailsRequest();
    stateDetailsRequest.companyUniqueName = selectedCompanyUniqueName;
    stateDetailsRequest.lastState = 'company.content.ledgerContent@giddh';

    this.store.dispatch(this.companyActions.SetStateDetails(stateDetailsRequest));
  }

  public deleteCompany() {
    this.store.dispatch(this.companyActions.DeleteCompany(this.markForDeleteCompany.uniqueName));
    this.hideDeleteCompanyModal();
  }

  public showDeleteCompanyModal(company: ComapnyResponse, e: Event) {
    this.markForDeleteCompany = company;
    this.deleteCompanyBody = `Are You Sure You Want To Delete ${company.name} ? `;
    this.deleteCompanyModal.show();
    e.stopPropagation();
  }
  public hideDeleteCompanyModal() {
    this.deleteCompanyModal.hide();
  }

  public logout() {
    this.store.dispatch(this.loginAction.LogOut());

  }
  public onHide() {
    this.store.dispatch(this.companyActions.ResetCompanyPopup());
  }
  public loadAddCompanyComponent() {
    let componentFactory = this.componentFactoryResolver.resolveComponentFactory(CompanyAddComponent);
    let viewContainerRef = this.elementViewContainerRef.viewContainerRef;
    viewContainerRef.clear();
    let componentRef = viewContainerRef.createComponent(componentFactory);
    (componentRef.instance as CompanyAddComponent).closeCompanyModal.subscribe((a) => {
      this.hideAddCompanyModal();
    });
    (componentRef.instance as CompanyAddComponent).closeCompanyModalAndShowAddManege.subscribe((a) => {
      this.hideCompanyModalAndShowAddAndManage();
    });
  }
}
