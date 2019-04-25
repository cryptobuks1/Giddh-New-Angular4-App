import { GstRoutingModule } from './gst.routing.module';
import { PurchaseModule } from '../purchase/purchase.module';
import { PushToGstInComponent } from './filing/tabs/push-to-gstin/push-to-gstin.component';
import { TransactionSummaryComponent } from './filing/tabs/push-to-gstin/components/transaction-summary/transaction-summary.component';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

import { FilingComponent } from './filing/filing.component';
import { NgModule } from '@angular/core';
import { FileGstR1Component } from './gstR1/gstR1.component';
import { OverviewSummaryComponent } from './filing/tabs/overview/summary/summary.component';
import { HighlightModule } from '../shared/helpers/pipes/highlightPipe/highlight.module';
import { DecimalDigitsModule } from '../shared/helpers/directives/decimalDigits/decimalDigits.module';
import { FileGstR2Component } from './gstR2/gstR2.component';
import { B2csSummaryComponent } from './filing/tabs/push-to-gstin/components/b2cs-summary/b2cs-summary.component';
import { NilSummaryComponent } from './filing/tabs/push-to-gstin/components/nil-summary/nil-summary.component';
import { FilingHeaderComponent } from './filing/header/header.component';
import { Daterangepicker } from '../theme/ng2-daterangepicker/daterangepicker.module';
import { HsnSummaryComponent } from './filing/tabs/push-to-gstin/components/hsn-summary/hsn-summary.component';
import { ElementViewChildModule } from '../shared/helpers/directives/elementViewChild/elementViewChild.module';
import { ViewTransactionsComponent } from './filing/tabs/overview/view-transactions/view-transactions.component';
import { ClickOutsideModule } from 'ng-click-outside';
import { LaddaModule } from 'angular2-ladda';
import { FailedTransactionsComponent } from './filing/tabs/push-to-gstin/components/failed-transactions/failed-transactions.component';
import { DocumentIssuedComponent } from './filing/tabs/push-to-gstin/components/document-issued/document-issued.component';
import { ReconcileComponent } from './filing/tabs/reconcilation/reconcilation.component';
import { InvoiceModule } from '../invoice/invoice.module';
import { FileGstR3Component } from './gstR3/gstR3.component';
import { GstComponent } from './gst.component';
import { FilingOverviewComponent } from './filing/tabs/overview/overview.component';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { PaginationComponent } from 'ngx-bootstrap/pagination/pagination.component';
import { DatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { AlertModule } from 'ngx-bootstrap/alert';
import { ModalModule } from 'ngx-bootstrap/modal';


@NgModule({
  declarations: [FileGstR1Component, FileGstR2Component, FileGstR3Component, GstComponent, FilingComponent, FilingHeaderComponent, FilingOverviewComponent, ReconcileComponent, PushToGstInComponent, ViewTransactionsComponent, OverviewSummaryComponent, TransactionSummaryComponent, PushToGstInComponent, NilSummaryComponent, HsnSummaryComponent, B2csSummaryComponent, DocumentIssuedComponent, FailedTransactionsComponent],
  imports: [
    GstRoutingModule,
    CollapseModule,
    PaginationModule,
    DatepickerModule,
    BsDropdownModule,
    Daterangepicker,
    LaddaModule,
    HighlightModule,
    TooltipModule,
    ClickOutsideModule,
    TabsModule,
    ElementViewChildModule,
    AlertModule,
    DecimalDigitsModule,
    ModalModule,
    PurchaseModule,
    InvoiceModule
  ],
  providers: [],
  entryComponents: [
    PaginationComponent
  ],
  exports: [ViewTransactionsComponent]
})
export class GstModule {
}
