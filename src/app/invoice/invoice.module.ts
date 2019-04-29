import { NgModule } from '@angular/core';
import { InvoiceRoutingModule } from './invoice.routing.module';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';

// import { TooltipModule } from 'ngx-bootstrap/tooltip';
// import { PaginationModule  } from 'ngx-bootstrap/pagination';
// import { CollapseModule } from 'ngx-bootstrap/collapse';
// import { ModalModule } from 'ngx-bootstrap/modal';
// import { TabsModule } from 'ngx-bootstrap/tabs';
// import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
// import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
// import { PopoverModule } from 'ngx-bootstrap/popover';

@NgModule({
  declarations: [],
  imports: [
    InvoiceRoutingModule,
    NgbTypeaheadModule.forRoot(),

  ],
  exports: [
    InvoiceRoutingModule
  ]
})
export class InvoiceModule {
}
