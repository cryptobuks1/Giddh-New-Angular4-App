import { NgModule } from '@angular/core';
import { PurchaseRoutingModule } from './purchase.routing.module';
import { PurchaseInvoiceComponent } from './purchase-invoice/purchase.invoice.component';
import { PurchaseComponent } from './purchase.component';
import { AsideMenuPurchaseInvoiceSettingComponent } from './purchase-invoice/aside-menu/aside-menu-purchase-invoice-setting.component';
import { DatepickerModule } from 'ngx-bootstrap/datepicker';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { Daterangepicker } from '../theme/ng2-daterangepicker/daterangepicker.module';
import { LaddaModule } from 'angular2-ladda';
import { HighlightModule } from '../shared/helpers/pipes/highlightPipe/highlight.module';

/**
 * Created by kunalsaxena on 9/1/17.
 */

@NgModule({
  declarations: [PurchaseInvoiceComponent, PurchaseComponent, AsideMenuPurchaseInvoiceSettingComponent],
  imports: [
    PurchaseRoutingModule,
    CollapseModule,
    PaginationModule,
    DatepickerModule,
    BsDropdownModule,
    Daterangepicker,
    LaddaModule,
    HighlightModule
  ]
})
export class PurchaseModule { }
