import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { VatReportRoutingModule } from './vatReport.routing.module';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { VatReportComponent } from './vatReport.component';
import { VatReportListComponent } from './components/test/vat-report-list.component';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [
    VatReportComponent,
    VatReportListComponent
  ],
  imports: [
    VatReportRoutingModule,
    TabsModule,
    CommonModule
  ],
  exports: [
    VatReportRoutingModule
  ]
})
export class VarReportModule {
}
// InvoiceModule
