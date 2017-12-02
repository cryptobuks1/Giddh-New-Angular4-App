import { ShSelectModule } from './../theme/ng-virtual-select/sh-select.module';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ModalModule } from 'ngx-bootstrap/modal';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

import { NeedsAuthentication } from '../decorators/needsAuthentication';
import { InvoiceComponent } from './invoice.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InvoiceGenerateComponent } from './generate/invoice.generate.component';
import { InvoicePreviewComponent } from './preview/invoice.preview.component';
import { InvoiceCreateComponent } from './create/invoice.create.component';
import { InvoiceTemplatesModule } from './templates/invoice.templates.module';
import { EditInvoiceComponent } from './templates/edit-template/edit.invoice.component';
import { InvoiceSettingComponent } from './settings/invoice.settings.component';

import { FontPickerConfigInterface, FontPickerModule } from 'ngx-font-picker';
import { NgUploaderModule } from 'ngx-uploader';
import { DesignFiltersContainerComponent } from './templates/edit-template/filters-container/design-filters/design.filters.component';
import { EditFiltersContainersComponent } from './templates/edit-template/filters-container/edit.filters.component';
import { InvoiceUiDataService } from '../services/invoice.ui.data.service';
import { DeleteInvoiceConfirmationModelComponent } from './preview/models/confirmation/confirmation.model.component';
import { PerformActionOnInvoiceModelComponent } from './preview/models/perform_action/invoice.action.model.component';
import { InvoiceGenerateModelComponent } from './generate/model/invoice.generate.model.component';
import { DownloadOrSendInvoiceOnMailComponent } from './preview/models/download-or-send-mail/download-or-send-mail.component';
import { InvoiceTemplateModalComponent } from './templates/edit-template/modals/template-modal/template-modal.component';
import { InvoiceEmailFilterComponent } from './templates/edit-template/filters-container/email-filter/email-filter.component';
import { DeleteTemplateConfirmationModelComponent } from './templates/edit-template/modals/confirmation-modal/confirmation.modal.component';
import { InvoiceTemplatePreviewModelComponent } from './templates/edit-template/modals/template-preview-modal/template-preview.modal.component';
import { EsignModalComponent } from './preview/models/e-Sign/e-Sign.component';
import { InvoicePageDDComponent } from '../shared/invoice-page-dd/invoice.page.dd.component';
import { SelectModule } from '../theme/ng-select/ng-select';
import { LaddaModule } from 'angular2-ladda';

const FONT_PICKER_CONFIG: FontPickerConfigInterface = {
  apiKey: 'AIzaSyAPcvNvidnjQL-a_2xW2QYox3hT7DQBWyo'
};
const INVOICE_ROUTES: Routes = [
  {
    path: '',
    canActivate: [NeedsAuthentication],
    component: InvoiceComponent,
    children: [
      { path: '', redirectTo: 'preview', pathMatch: 'full' },
      { path: 'preview', component: InvoicePreviewComponent },
      { path: 'generate', component: InvoiceGenerateComponent },
      { path: 'templates', component: EditInvoiceComponent },
      { path: 'settings', component: InvoiceSettingComponent },
    ]
  }
];

@NgModule({
  declarations: [
    InvoiceComponent,
    InvoicePreviewComponent,
    InvoiceGenerateComponent,
    EditInvoiceComponent,
    InvoiceCreateComponent,
    DesignFiltersContainerComponent,
    EditFiltersContainersComponent,
    InvoiceSettingComponent,
    DeleteInvoiceConfirmationModelComponent,
    PerformActionOnInvoiceModelComponent,
    InvoiceGenerateModelComponent,
    DownloadOrSendInvoiceOnMailComponent,
    InvoiceTemplateModalComponent,
    InvoiceEmailFilterComponent,
    DeleteTemplateConfirmationModelComponent,
    InvoiceTemplatePreviewModelComponent,
    EsignModalComponent,
    InvoicePageDDComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    ModalModule,
    TooltipModule,
    PaginationModule,
    RouterModule.forChild(INVOICE_ROUTES),
    InvoiceTemplatesModule,
    FontPickerModule.forRoot(FONT_PICKER_CONFIG),
    BsDatepickerModule.forRoot(),
    NgUploaderModule,
    SelectModule,
    LaddaModule,
    ShSelectModule
  ],
  exports: [
    RouterModule,
    TooltipModule
  ],
  providers: [InvoiceUiDataService]
})
export class InvoiceRoutingModule { }
