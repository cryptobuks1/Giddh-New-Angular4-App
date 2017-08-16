import { Store } from '@ngrx/store';
import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import * as _ from 'lodash';
import { ComapnyResponse } from '../../../models/api-models/Company';
import { AppState } from '../../../store/roots';
import { TBPlBsActions } from '../../../services/actions/tl-pl.actions';
import { TrialBalanceRequest } from '../../../models/api-models/tb-pl-bs';

@Component({
  selector: 'tb',
  template: `
    <tb-pl-bs-filter #filter [selectedCompany]="selectedCompany" (onPropertyChanged)="filterData($event)"></tb-pl-bs-filter>
    <tb-grid [expandAll]="filter.expandAll"></tb-grid>
  `
})
export class TbComponent implements OnInit, AfterViewInit {
  public request: TrialBalanceRequest;
  public selectedCompany: ComapnyResponse;

  constructor(private store: Store<AppState>, private cd: ChangeDetectorRef, public tlPlActions: TBPlBsActions) {
    this.store.select(p => p.company.companies && p.company.companies.find(q => q.uniqueName === p.session.companyUniqueName)).subscribe(p => {
      this.selectedCompany = p;
      if (p) {
        this.request = {
          refresh: false,
          fromDate: this.selectedCompany.activeFinancialYear.financialYearStarts,
          toDate: this.selectedCompany.activeFinancialYear.financialYearEnds
        };
        this.filterData(this.request);
      }
    });
  }

  public ngOnInit() {
    console.log('hello Tb module');
  }

  public ngAfterViewInit() {
    this.cd.detectChanges();
  }

  public filterData(request: TrialBalanceRequest) {
    this.store.dispatch(this.tlPlActions.GetTrialBalance(_.cloneDeep(request)));
  }
}
