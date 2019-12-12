import {
    Component,
    TemplateRef,
    OnDestroy,
    OnInit,
    ViewChild,
    ElementRef
} from "@angular/core";
import { BsModalService, BsModalRef, ModalDirective } from "ngx-bootstrap/modal";
import { InventoryService } from '../../../services/inventory.service';
import { ReplaySubject, Observable } from 'rxjs';
import { Store, select, createSelector } from '@ngrx/store';
import { AppState } from '../../../store';
import { takeUntil, take } from 'rxjs/operators';
import { NewBranchTransferListResponse, NewBranchTransferListPostRequestParams, NewBranchTransferListGetRequestParams } from '../../../models/api-models/BranchTransfer';
import { branchTransferVoucherTypes, branchTransferAmountOperators } from "../../../shared/helpers/branchTransferFilters";
import { IOption } from '../../../theme/ng-select/ng-select';
import * as moment from 'moment/moment';
import { GIDDH_DATE_FORMAT } from '../../../shared/helpers/defaultDateFormat';
import { GeneralService } from '../../../services/general.service';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ToasterService } from '../../../services/toaster.service';

@Component({
    selector: "new-branch-transfer-list",
    templateUrl: "./new.branch.transfer.list.component.html",
    styleUrls: ["./new.branch.transfer.component.scss"],
    animations: [
        trigger('slideInOut', [
            state('in', style({
                transform: 'translate3d(0, 0, 0);'
            })),
            state('out', style({
                transform: 'translate3d(100%, 0, 0);'
            })),
            transition('in => out', animate('400ms ease-in-out')),
            transition('out => in', animate('400ms ease-in-out'))
        ]),
    ]
})

export class NewBranchTransferListComponent implements OnInit, OnDestroy {
    @ViewChild('branchtransfertemplate') public branchtransfertemplate: ElementRef;
    @ViewChild('deleteBranchTransferModal') public deleteBranchTransferModal: ModalDirective;

    public modalRef: BsModalRef;
    private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
    public activeCompany: any = {};
    public voucherTypes: IOption[] = [];
    public amountOperators: IOption[] = [];
    public branchTransferResponse: NewBranchTransferListResponse;
    public universalDate$: Observable<any>;
    public datePicker: any[] = [];
    public moment = moment;
    public asidePaneState: string = 'out';
    public asideTransferPaneState: string = 'out';
    public branchTransferMode: string = '';
    public inlineSearch: any = '';
    public timeout: any;
    public selectedBranchTransfer: any = '';
    public editBranchTransferUniqueName: string = '';

    public branchTransferGetRequestParams: NewBranchTransferListGetRequestParams = {
        from: '',
        to: '',
        page: 1,
        count: 50,
        sort: '',
        sortBy: '',
    };
    public branchTransferPostRequestParams: NewBranchTransferListPostRequestParams = {
        amountOperator: null,
        amount: null,
        voucherType: null,
        date: null,
        voucherNo: null,
        senderReceiver: null,
        warehouseName: null
    };
    public branchTransferTempPostRequestParams: any = {
        amountOperator: null,
        amount: null,
        voucherType: null
    };

    constructor(private _generalService: GeneralService, private modalService: BsModalService, private store: Store<AppState>, private inventoryService: InventoryService, private _toasty: ToasterService) {
        this.store.pipe(select(p => p.settings.profile), takeUntil(this.destroyed$)).subscribe((o) => {
            if (o && !_.isEmpty(o)) {
                let companyInfo = _.cloneDeep(o);
                this.activeCompany = companyInfo;
            }
        });
        this.universalDate$ = this.store.select(p => p.session.applicationDate).pipe(takeUntil(this.destroyed$));
    }

    public ngOnInit(): void {
        this.initBranchTransferListResponse();

        branchTransferVoucherTypes.map(voucherType => {
            this.voucherTypes.push({ label: voucherType.label, value: voucherType.value });
        });

        branchTransferAmountOperators.map(amountOperator => {
            this.amountOperators.push({ label: amountOperator.label, value: amountOperator.value });
        });

        this.store.select(createSelector([(states: AppState) => states.session.applicationDate], (dateObj: Date[]) => {
            if (dateObj && !this.datePicker[0]) {
                let universalDate = _.cloneDeep(dateObj);
                this.datePicker = [moment(universalDate[0], GIDDH_DATE_FORMAT).toDate(), moment(universalDate[1], GIDDH_DATE_FORMAT).toDate()];

                this.branchTransferGetRequestParams.from = moment(universalDate[0]).format(GIDDH_DATE_FORMAT);
                this.branchTransferGetRequestParams.to = moment(universalDate[1]).format(GIDDH_DATE_FORMAT);
            }
        })).pipe(takeUntil(this.destroyed$)).subscribe();
    }

    public ngOnDestroy(): void {
        this.destroyed$.next(true);
        this.destroyed$.complete();
    }

    public openSearchModal(template: TemplateRef<any>): void {
        this.modalRef = this.modalService.show(template);
    }

    public initBranchTransferListResponse(): void {
        this.branchTransferResponse = {
            items: null,
            fromDate: null,
            toDate: null,
            page: null,
            count: null,
            totalPages: null,
            totalItems: null,
        };
    }

    public getBranchTransferList(resetPage: boolean): void {
        if (resetPage) {
            this.branchTransferGetRequestParams.page = 1;
        }

        this.inventoryService.getBranchTransferList(this.branchTransferGetRequestParams, this.branchTransferPostRequestParams).subscribe((response) => {
            if (response.status === "success") {
                this.branchTransferResponse = response.body;
            } else {
                this.initBranchTransferListResponse();
            }
        });
    }

    public pageChanged(event: any): void {
        this.branchTransferGetRequestParams.page = event.page;
        this.getBranchTransferList(false);
    }

    public changeFilterDate(date): void {
        if (date) {
            this.branchTransferGetRequestParams.from = moment(date[0]).format(GIDDH_DATE_FORMAT);
            this.branchTransferGetRequestParams.to = moment(date[1]).format(GIDDH_DATE_FORMAT);
            this.getBranchTransferList(true);
        }
    }

    public search(): void {
        this.branchTransferPostRequestParams.voucherType = this.branchTransferTempPostRequestParams.voucherType;
        this.branchTransferPostRequestParams.amountOperator = this.branchTransferTempPostRequestParams.amountOperator;
        this.branchTransferPostRequestParams.amount = this.branchTransferTempPostRequestParams.amount;
        this.getBranchTransferList(true);
        this.modalRef.hide();
    }

    public toggleTransferAsidePane(event?): void {
        this.editBranchTransferUniqueName = '';

        if (event) {
            event.preventDefault();
        }
        this.asideTransferPaneState = this.asideTransferPaneState === 'out' ? 'in' : 'out';
        this.toggleBodyClass();
    }

    public toggleBodyClass(): void {
        if (this.asidePaneState === 'in' || this.asideTransferPaneState === 'in') {
            document.querySelector('body').classList.add('fixed');
        } else {
            document.querySelector('body').classList.remove('fixed');
        }
    }

    public openModal(): void {
        this.modalRef = this.modalService.show(
            this.branchtransfertemplate,
            Object.assign({}, { class: 'modal-lg reciptNoteModal mb-0' })
        );
    }

    public hideModal(): void {
        this.modalRef.hide();
    }

    public columnSearch(): void {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }

        this.timeout = setTimeout(() => {
            this.getBranchTransferList(true);
        }, 700);
    }

    public deleteNewBranchTransfer(): void {
        this.hideBranchTransferModal();
        this.inventoryService.deleteNewBranchTransfer(this.selectedBranchTransfer).subscribe((response) => {
            if (response.status === "success") {
                this._toasty.successToast(response.body);
                this.getBranchTransferList(false);
            } else {
                this._toasty.errorToast(response.body);
            }
        });
    }

    public showBranchTransferModal(branchTransferUniqueName): void {
        this.selectedBranchTransfer = branchTransferUniqueName;
        this.deleteBranchTransferModal.show();
    }

    public hideBranchTransferModal(): void {
        this.deleteBranchTransferModal.hide();
    }

    public sortBranchTransferList(sortBy): void {
        let sort = "asc";

        if (this.branchTransferGetRequestParams.sortBy === sortBy) {
            sort = (this.branchTransferGetRequestParams.sort === "asc") ? "desc" : "asc";
        } else {
            sort = "asc";
        }

        this.branchTransferGetRequestParams.sort = sort;
        this.branchTransferGetRequestParams.sortBy = sortBy;

        this.getBranchTransferList(true);
    }

    public showEditBranchTransferPopup(item): void {
        this.branchTransferMode = item.voucherType;
        this.editBranchTransferUniqueName = item.uniqueName;
        this.openModal();
    }

    public clearFilters(): void {
        this.branchTransferPostRequestParams.senderReceiver = null;
        this.branchTransferPostRequestParams.warehouseName = null;
        this.branchTransferPostRequestParams.voucherType = null;
        this.branchTransferPostRequestParams.amountOperator = null;
        this.branchTransferPostRequestParams.amount = null;
        this.branchTransferGetRequestParams.sort = "";
        this.branchTransferGetRequestParams.sortBy = "";

        this.getBranchTransferList(true);
    }

    public checkIfFiltersApplied(): boolean {
        if (this.branchTransferPostRequestParams.senderReceiver || this.branchTransferPostRequestParams.warehouseName || this.branchTransferPostRequestParams.voucherType || this.branchTransferPostRequestParams.amountOperator || this.branchTransferPostRequestParams.amount) {
            return true;
        } else {
            return false;
        }
    }

    public checkIfAmountEmpty(): void {
        if (this.branchTransferPostRequestParams.amountOperator && !this.branchTransferPostRequestParams.amount) {
            this.branchTransferPostRequestParams.amount = 0;
        }
    }

    public openBranchTransferPopup(event): void {
        this.branchTransferMode = event;
        this.toggleTransferAsidePane();
        this.openModal();
    }

    public refreshTempPostParams(): void {
        this.branchTransferTempPostRequestParams.voucherType = this.branchTransferPostRequestParams.voucherType;
        this.branchTransferTempPostRequestParams.amountOperator = this.branchTransferPostRequestParams.amountOperator;
        this.branchTransferTempPostRequestParams.amount = this.branchTransferPostRequestParams.amount;
    }
}
