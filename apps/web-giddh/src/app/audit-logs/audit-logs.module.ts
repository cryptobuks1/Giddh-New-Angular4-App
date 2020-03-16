import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LaddaModule } from 'angular2-ladda';
import { BsDatepickerModule, DatepickerModule } from 'ngx-bootstrap/datepicker';

import { ShSelectModule } from '../theme/ng-virtual-select/sh-select.module';
import { AuditLogsComponent } from './audit-logs.component';
import { AuditLogsRoutingModule } from './audit-logs.routing.module';
import { AuditLogsGridComponent } from './components/audit-logs-grid/audit-logs-grid.component';
import { AuditLogsSidebarComponent } from './components/sidebar-components/audit-logs.sidebar.component';
import { AuditLogsServiceModule } from './services/audit-logs.service.module';

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        AuditLogsComponent,
        AuditLogsSidebarComponent,
        AuditLogsGridComponent
    ],
    exports: [
        AuditLogsComponent,
        AuditLogsSidebarComponent
    ],
    providers: [],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        AuditLogsRoutingModule,
        DatepickerModule,
        BsDatepickerModule,
        LaddaModule,
        ShSelectModule,
        AuditLogsServiceModule
    ],
})
export class AuditLogsModule {
}
