import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginRoutingModule } from './login.routing.module';
import { ModalModule } from 'ngx-bootstrap/modal';
import { LaddaModule } from 'angular2-ladda';
import { ShSelectModule } from '../theme/ng-virtual-select/sh-select.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LoginRoutingModule,
    ModalModule,
    LaddaModule,
    ShSelectModule
  ],
  declarations: [LoginComponent]
})
export class LoginModule {
}
