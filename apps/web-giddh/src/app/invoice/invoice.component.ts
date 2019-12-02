import { auditTime, take } from 'rxjs/operators';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { AppState } from '../store';
import { CompanyActions } from '../actions/company.actions';
import { StateDetailsRequest } from '../models/api-models/Company';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, ReplaySubject } from 'rxjs';
import { TabsetComponent } from 'ngx-bootstrap';
import { VoucherTypeEnum } from '../models/api-models/Sales';
import { BreakpointObserver } from '@angular/cdk/layout';
import { GeneralService } from '../services/general.service';
@Component({
    styles: [],
    templateUrl: './invoice.component.html'
})
export class InvoiceComponent implements OnInit, OnDestroy {
    @ViewChild('staticTabs') public staticTabs: TabsetComponent;

    public selectedVoucherType: VoucherTypeEnum;
    public activeTab: string;
    private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
    public isMobileView = false;
    constructor(private store: Store<AppState>,
        private companyActions: CompanyActions,
        private router: Router,
        private _cd: ChangeDetectorRef, private _activatedRoute: ActivatedRoute, private _breakPointObservar: BreakpointObserver, private _generalService: GeneralService) {
        this._breakPointObservar.observe([
            '(max-width: 1023px)'
        ]).subscribe(result => {
            this.isMobileView = result.matches;
        });
    }

    public ngOnInit() {
        combineLatest([this._activatedRoute.params, this._activatedRoute.queryParams])
            .pipe(auditTime(700))
            .subscribe(result => {
                let params = result[0];
                let queryParams = result[1];

                if (params) {
                    if (params.voucherType === 'sales' || params.voucherType === 'debit note' || params.voucherType === 'credit note') {
                        this.selectedVoucherType = params.voucherType;
                    }

                    if (queryParams && queryParams.tab) {
                        if (queryParams.tab && queryParams.tabIndex) {
                            if (this.staticTabs && this.staticTabs.tabs) {
                                /*
                                  set active tab to null because we want to reload the tab component
                                  case :-
                                          when invoice preview details is on then if someone clicks on sidemenu or navigate using cmd + g then we need to
                                          reload the component
                                 */
                                this.activeTab = null;
                                setTimeout(() => {
                                    this.tabChanged(queryParams.tab, null);
                                }, 500);
                            }
                        }
                    } else {
                        this.activeTab = params.voucherType;
                    }
                }
            });

        // this._activatedRoute.params.pipe(takeUntil(this.destroyed$), delay(700)).subscribe(a => {
        //   if (!a) {
        //     return;
        //   }
        //   if (a.voucherType === 'recurring') {
        //     return;
        //   }
        //   this.selectedVoucherType = a.voucherType;
        //   if (a.voucherType === 'sales') {
        //     this.activeTab = 'invoice';
        //   } else {
        //     this.activeTab = a.voucherType;
        //   }
        // });
        //
        // this._activatedRoute.queryParams.pipe(takeUntil(this.destroyed$), delay(700)).subscribe(a => {
        //   if (a.tab && a.tabIndex) {
        //     if (this.staticTabs && this.staticTabs.tabs) {
        //       this.staticTabs.tabs[a.tabIndex].active = true;
        //       this.tabChanged(a.tab);
        //     }
        //   }
        // });
    }

    public voucherChanged(tab: string) {
        this.selectedVoucherType = VoucherTypeEnum[tab];
    }

    public tabChanged(tab: string, e) {
        this.activeTab = tab;
        this.router.navigate(['pages', 'invoice', 'preview', tab]);
        if (e && !e.target) {
            this.saveLastState(tab);
        }
    }

    public ngOnDestroy() {
        this.destroyed$.next(true);
        this.destroyed$.complete();
    }

    private saveLastState(state: string) {
        let companyUniqueName = null;
        this.store.pipe(select(c => c.session.companyUniqueName), take(1)).subscribe(s => companyUniqueName = s);
        let stateDetailsRequest = new StateDetailsRequest();
        stateDetailsRequest.companyUniqueName = companyUniqueName;
        stateDetailsRequest.lastState = `pages/invoice/preview/${state}`;

        this.store.dispatch(this.companyActions.SetStateDetails(stateDetailsRequest));
    }
}
