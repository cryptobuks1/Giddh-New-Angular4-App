import { InvoicePurchaseActions } from '../../../../actions/purchase-invoice/purchase-invoice.action';
import { Component, ComponentFactoryResolver, Input, OnChanges, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { ToasterService } from '../../../../services/toaster.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ReconcileActionState } from '../../../../store/GstReconcile/GstReconcile.reducer';
import { CompanyActions } from '../../../../actions/company.actions';
import { AlertConfig, BsDropdownConfig, PaginationComponent } from 'ngx-bootstrap';
import { ElementViewContainerRef } from '../../../../shared/helpers/directives/elementViewChild/element.viewchild.directive';
import { GstReconcileActionsEnum, GstReconcileInvoiceDetails, GstReconcileInvoiceRequest } from '../../../../models/api-models/GstReconcile';
import { AppState } from '../../../../store';
import { shareReplay, take, takeUntil } from 'rxjs/operators';
import { GstReconcileActions } from '../../../../actions/gst-reconcile/GstReconcile.actions';
import { Router } from '@angular/router';
import { PurchaseInvoiceService } from '../../../../services/purchase-invoice.service';
import { Observable, ReplaySubject } from 'rxjs';
import { AccountService } from '../../../../services/account.service';
import * as moment from 'moment';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'reconcile',
  templateUrl: './reconcilation.component.html',
  providers: [
    {
      provide: BsDropdownConfig, useValue: {autoClose: true},
    },
    {
      provide: AlertConfig, useValue: {}
    }
  ],
  animations: [
    trigger('slideInOut', [
      state('in', style({
        transform: 'translate3d(0, 0, 0)'
      })),
      state('out', style({
        transform: 'translate3d(100%, 0, 0)'
      })),
      transition('in <=> out', animate('400ms ease-in-out')),
    ])
  ]
})
export class ReconcileComponent implements OnInit, OnDestroy, OnChanges {
  @Input() public data: GstReconcileInvoiceDetails = null;
  @Input() public currentPeriod: any = null;
  @Input() public activeCompanyGstNumber: string = '';
  @Input() public selectedGst: string = '';
  @Input() public selectedTab: string = '';

  @ViewChild('pgGstNotFoundOnPortal') public pgGstNotFoundOnPortal: ElementViewContainerRef;
  @ViewChild('pgGstNotFoundOnGiddh') public pgGstNotFoundOnGiddh: ElementViewContainerRef;
  @ViewChild('pgPartiallyMatched') public pgPartiallyMatched: ElementViewContainerRef;
  @ViewChild('pgMatched') public pgMatched: ElementViewContainerRef;

  public gstReconcileInvoiceRequestInProcess$: Observable<boolean>;
  public gstAuthenticated$: Observable<boolean>;
  public gstNotFoundOnGiddhData$: Observable<ReconcileActionState>;
  public gstNotFoundOnPortalData$: Observable<ReconcileActionState>;
  public gstMatchedData$: Observable<ReconcileActionState>;
  public gstPartiallyMatchedData$: Observable<ReconcileActionState>;
  public reconcileActiveTab: GstReconcileActionsEnum = GstReconcileActionsEnum.notfoundonportal;
  public moment = moment;
  public pullFromGstInProgress$: Observable<boolean>;
  public imgPath: string = '';

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private router: Router,
    private store: Store<AppState>,
    private invoicePurchaseActions: InvoicePurchaseActions,
    private toasty: ToasterService,
    private companyActions: CompanyActions,
    private purchaseInvoiceService: PurchaseInvoiceService,
    private accountService: AccountService,
    private _reconcileActions: GstReconcileActions,
    private componentFactoryResolver: ComponentFactoryResolver,
  ) {
    this.gstReconcileInvoiceRequestInProcess$ = this.store.pipe(select(s => s.gstReconcile.isGstReconcileInvoiceInProcess), takeUntil(this.destroyed$));
    this.gstAuthenticated$ = this.store.pipe(select(p => p.gstR.gstAuthenticated), takeUntil(this.destroyed$));
    this.gstNotFoundOnGiddhData$ = this.store.pipe(select(p => p.gstReconcile.gstReconcileData.notFoundOnGiddh), takeUntil(this.destroyed$));
    this.gstNotFoundOnPortalData$ = this.store.pipe(select(p => p.gstReconcile.gstReconcileData.notFoundOnPortal), takeUntil(this.destroyed$),
      shareReplay(1));
    this.gstMatchedData$ = this.store.pipe(select(p => p.gstReconcile.gstReconcileData.matched), takeUntil(this.destroyed$));
    this.gstPartiallyMatchedData$ = this.store.pipe(select(p => p.gstReconcile.gstReconcileData.partiallyMatched), takeUntil(this.destroyed$));
    this.pullFromGstInProgress$ = this.store.pipe(select(p => p.gstReconcile.isPullFromGstInProgress), takeUntil(this.destroyed$));
  }

  public ngOnInit() {
    this.imgPath = isElectron ? 'assets/images/gst/' : AppUrl + APP_FOLDER + 'assets/images/gst/';

    this.fireGstReconcileRequest(GstReconcileActionsEnum.notfoundonportal);
  }

  public reconcileTabChanged(action: string) {
    this.reconcileActiveTab = GstReconcileActionsEnum[action];
    this.fireGstReconcileRequest(this.reconcileActiveTab, this.getPageNo());
  }

  public reconcilePageChanged(event: any, action: string) {
    this.fireGstReconcileRequest(GstReconcileActionsEnum[action], event.page);
  }

  public fireGstReconcileRequest(action: GstReconcileActionsEnum, page: number = 1, refresh: boolean = false) {
    if (!this.currentPeriod) {
      return;
    }
    let request: GstReconcileInvoiceRequest = new GstReconcileInvoiceRequest();
    request.from = this.currentPeriod.from;
    request.to = this.currentPeriod.to;
    request.page = page;
    request.refresh = refresh;
    request.action = action;
    request.count = 3;
    this.store.dispatch(this._reconcileActions.GstReconcileInvoiceRequest(request));
  }

  // public loadReconcilePaginationComponent(s: ReconcileActionState, action: string) {
  //   if (s.count === 0) {
  //     return;
  //   }
  //
  //   if (action !== this.reconcileActiveTab) {
  //     return;
  //   }
  //
  //   let componentFactory = this.componentFactoryResolver.resolveComponentFactory(PaginationComponent);
  //   let viewContainerRef = null;
  //   switch (this.reconcileActiveTab) {
  //     case GstReconcileActionsEnum.notfoundongiddh:
  //       viewContainerRef = this.pgGstNotFoundOnGiddh.viewContainerRef;
  //       break;
  //     case GstReconcileActionsEnum.notfoundonportal:
  //       viewContainerRef = this.pgGstNotFoundOnPortal.viewContainerRef;
  //       break;
  //     case GstReconcileActionsEnum.matched:
  //       viewContainerRef = this.pgMatched.viewContainerRef;
  //       break;
  //     case GstReconcileActionsEnum.partiallymatched:
  //       viewContainerRef = this.pgPartiallyMatched.viewContainerRef;
  //       break;
  //   }
  //
  //   if (viewContainerRef) {
  //     viewContainerRef.remove();
  //     let componentInstanceView = componentFactory.create(viewContainerRef.parentInjector);
  //     viewContainerRef.insert(componentInstanceView.hostView);
  //
  //     let componentInstance = componentInstanceView.instance as PaginationComponent;
  //
  //     componentInstance.totalItems = s.data.totalItems;
  //     componentInstance.itemsPerPage = s.data.count;
  //     componentInstance.maxSize = 5;
  //     componentInstance.writeValue(s.data.page);
  //     componentInstance.boundaryLinks = true;
  //     componentInstance.pageChanged.pipe(takeUntil(this.destroyed$)).subscribe(e => {
  //       this.reconcilePageChanged(e, this.reconcileActiveTab);
  //     });
  //   }
  // }

  /**
   * ngOnChanges
   */
  public ngOnChanges() {
    //
  }

  public ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  public getPageNo(): number {
    let page = 1;

    switch (this.reconcileActiveTab) {
      case GstReconcileActionsEnum.notfoundongiddh:
        this.gstNotFoundOnGiddhData$.pipe(take(1)).subscribe(data => {
          if (data && data.data) {
            page = data.data.page;
          }
        });
        break;
      case GstReconcileActionsEnum.notfoundonportal:
        this.gstNotFoundOnPortalData$.pipe(take(1)).subscribe(data => {
          if (data && data.data) {
            page = data.data.page;
          }
        });
        break;
      case GstReconcileActionsEnum.matched:
        this.gstMatchedData$.pipe(take(1)).subscribe(data => {
          if (data && data.data) {
            page = data.data.page;
          }
        });
        break;
      case GstReconcileActionsEnum.partiallymatched:
        this.gstPartiallyMatchedData$.pipe(take(1)).subscribe(data => {
          if (data && data.data) {
            page = data.data.page;
          }
        });
        break;
    }

    return page;
  }

}
