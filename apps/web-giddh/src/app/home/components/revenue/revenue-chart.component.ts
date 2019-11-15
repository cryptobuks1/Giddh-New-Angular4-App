import {take, takeUntil} from 'rxjs/operators';
import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Options} from 'highcharts';
import {ActiveFinancialYear, CompanyResponse} from '../../../models/api-models/Company';
import {Observable, ReplaySubject} from 'rxjs';
import {IChildGroups, IRevenueChartClosingBalanceResponse} from '../../../models/interfaces/dashboard.interface';
import {HomeActions} from '../../../actions/home/home.actions';
import {select, Store} from '@ngrx/store';
import {AppState} from '../../../store/roots';
import * as moment from 'moment/moment';
import {RevenueGraphDataRequest} from "../../../models/api-models/Dashboard";
import {GIDDH_DATE_FORMAT} from '../../../shared/helpers/defaultDateFormat';
import {GiddhCurrencyPipe} from '../../../shared/helpers/pipes/currencyPipe/currencyType.pipe';
import {DashboardService} from "../../../services/dashboard.service";

@Component({
	selector: 'revenue-chart',
	templateUrl: 'revenue-chart.component.html',
	styleUrls: ['revenue-chart.component.scss', '../../home.component.scss']
})

export class RevenueChartComponent implements OnInit, OnDestroy {
	@Input() public refresh: boolean = false;
	public requestInFlight: boolean = false;
	public options: Options;
	public activeFinancialYear: ActiveFinancialYear;
	public lastFinancialYear: ActiveFinancialYear;
	public companies$: Observable<CompanyResponse[]>;
	public activeCompanyUniqueName$: Observable<string>;
	@Input() public revenueChartData: Observable<IRevenueChartClosingBalanceResponse>;
	public revenueGraphTypes: any[] = [];
	public activeGraphType: any;
	public graphParams: any = {
		currentFrom: '',
		currentTo: '',
		previousFrom: '',
		previousTo: '',
		interval: 'daily',
		type: '',
		uniqueName: '',
		refresh: false
	};
	public moment = moment;
	public currentData: any[] = [];
	public previousData: any[] = [];
	public summaryData: any = {totalCurrent: 0, totalLast: 0, highest: 0, lowest: 0};
	public activeCompany: any = {};
	private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

	constructor(private store: Store<AppState>, private _homeActions: HomeActions, public currencyPipe: GiddhCurrencyPipe) {
		this.activeCompanyUniqueName$ = this.store.select(p => p.session.companyUniqueName).pipe(takeUntil(this.destroyed$));
		this.companies$ = this.store.select(p => p.session.companies).pipe(takeUntil(this.destroyed$));

		let getCurrentWeekStartEndDate = this.getWeekStartEndDate(new Date());
		let getPreviousWeekStartEndDate = this.getWeekStartEndDate(moment(getCurrentWeekStartEndDate[0]).subtract(1, 'days'));

		this.graphParams.currentFrom = moment(getCurrentWeekStartEndDate[0]).format(GIDDH_DATE_FORMAT);
		this.graphParams.currentTo = moment(getCurrentWeekStartEndDate[1]).format(GIDDH_DATE_FORMAT);
		this.graphParams.previousFrom = moment(getPreviousWeekStartEndDate[0]).format(GIDDH_DATE_FORMAT);
		this.graphParams.previousTo = moment(getPreviousWeekStartEndDate[1]).format(GIDDH_DATE_FORMAT);

		this.getRevenueGraphTypes();
	}

	public ngOnInit() {
		this.companies$.subscribe(c => {
			if (c) {
				let activeCompany: CompanyResponse;
				this.activeCompanyUniqueName$.pipe(take(1)).subscribe(a => {
					activeCompany = c.find(p => p.uniqueName === a);
					if (activeCompany) {
						this.activeCompany = activeCompany;
					}
				});
			}
		});
	}

	public ngOnDestroy() {
		this.destroyed$.next(true);
		this.destroyed$.complete();
	}

	public getRevenueGraphTypes() {
		this.store.pipe(select(s => s.home.revenueGraphTypes), takeUntil(this.destroyed$)).subscribe(res => {
			this.revenueGraphTypes = [];

			if (res && res.length > 0) {
				Object.keys(res).forEach(key => {
					if (key === "0") {
						this.activeGraphType = res[key];
						this.graphParams.uniqueName = this.activeGraphType['uniqueName'];
						this.graphParams.type = this.activeGraphType['type'];
					}
					this.revenueGraphTypes.push({uniqueName: res[key].uniqueName, type: res[key].type});
				});

				this.getRevenueGraphData();
			} else {
				this.store.dispatch(this._homeActions.getRevenueGraphTypes());
			}
		});
	}

	public getRevenueGraphData() {
		this.store.pipe(select(s => s.home.revenueGraphData), takeUntil(this.destroyed$)).subscribe(res => {
			this.currentData = [];
			this.previousData = [];
			this.summaryData.totalCurrent = 0;
			this.summaryData.totalLast = 0;
			this.summaryData.highest = 0;
			this.summaryData.lowest = 0;
			
			if (res && res.balances) {
				if (res.balances !== null) {
					let x = 0;
					Object.keys(res.balances).forEach(key => {
						this.currentData.push({
							x: x,
							y: res.balances[key].current.closingBalance.amount,
							tooltip: res.balances[key].current.dateLabel + "<br />" + this.graphParams.uniqueName + ": " + this.activeCompany.baseCurrencySymbol + " " + this.currencyPipe.transform(res.balances[key].current.closingBalance.amount)
						});
						this.previousData.push({
							x: x,
							y: res.balances[key].previous.closingBalance.amount,
							tooltip: res.balances[key].previous.dateLabel + "<br />" + this.graphParams.uniqueName + ": " + this.activeCompany.baseCurrencySymbol + " " + this.currencyPipe.transform(res.balances[key].previous.closingBalance.amount)
						});
						x++;
					});
				}

				if (res.currentClosingBalance !== null && res.currentClosingBalance.amount !== null) {
					this.summaryData.totalCurrent = res.currentClosingBalance.amount;
				}

				if (res.previousClosingBalance !== null && res.previousClosingBalance.amount !== null) {
					this.summaryData.totalLast = res.previousClosingBalance.amount;
				}

				if (res.previousHighestClosingBalance !== null && res.previousHighestClosingBalance.amount !== null) {
					this.summaryData.highest = res.previousHighestClosingBalance.amount;
				}

				if (res.currentLowestClosingBalance !== null && res.currentLowestClosingBalance.amount !== null) {
					this.summaryData.lowest = res.currentLowestClosingBalance.amount;
				}

				this.generateChart();
			} else {
				this.getChartData();
			}
		});
	}

	public getChartData() {
		let revenueGraphDataRequest = new RevenueGraphDataRequest();
		revenueGraphDataRequest = this.graphParams;
		this.store.dispatch(this._homeActions.getRevenueGraphData(revenueGraphDataRequest));
	}

	public refreshChart() {
		this.store.dispatch(this._homeActions.resetRevenueGraphData());
	}

	public getWeekStartEndDate(date) {
		// If no date object supplied, use current date
		let now = date ? new Date(date) : new Date();

		// set time to some convenient value
		now.setHours(0, 0, 0, 0);

		// Get the previous Sunday
		let sunday = new Date(now);
		sunday.setDate(sunday.getDate() - sunday.getDay() + 0);

		// Get next Saturday
		let saturday = new Date(now);
		saturday.setDate(saturday.getDate() - saturday.getDay() + 6);

		// Return array of date objects
		return [sunday, saturday];
	}

	public generateChart() {
		this.options = {
			chart: {
				type: 'column',
				height: '256px'
			},
			colors: ['#0CB1AF', '#087E7D'],
			title: {
				text: ''
			},
			credits: {
				enabled: false
			},
			series: [{
				name: '',
				data: this.currentData
			}, {
				name: '',
				data: this.previousData
			}
			],
			legend: {
				enabled: false
			},
			tooltip: {
				useHTML: true,
				formatter: function () {
					return this.point.tooltip;
				}
			}
		};

		this.requestInFlight = false;
	}

	public changeGraphType(gtype) {
		this.activeGraphType = gtype;
		this.graphParams.uniqueName = this.activeGraphType['uniqueName'];
		this.graphParams.type = this.activeGraphType['type'];

		this.refreshChart();
	}
}
