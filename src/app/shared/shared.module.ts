import { AccountFilterPipe } from './header/pipe/accountfilter.pipe';
import { CommonModule } from '@angular/common';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { Ng2BootstrapModule } from 'ngx-bootstrap';
import { LaddaModule } from 'angular2-ladda';

import { LayoutComponent } from './layout/layout.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { FormWizardModule, ConfirmModalComponent } from './theme';
import { ToastrModule } from 'ngx-toastr';
import { SelectModule } from './theme/select/select.module';

import { ManageGroupsAccountsComponent, AccountsSideBarComponent, CompanyAddComponent, AccountOperationsComponent, GroupsRecursiveListComponent, GroupsRecursiveListItemComponent, GroupAccountsListComponent, AccountAddComponent } from './header/components';
import { Select2Module } from './theme/select2/select2.module';
import { TagsModule } from './theme/tags/tags.module';
import { UniqueNameDirective } from './helpers/directives/uniqueName.directive';
import { ClickOutsideModule } from 'ng-click-outside';
import { ElementViewContainerRef } from './helpers/directives/element.viewchild.directive';

const PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};
@NgModule({
  declarations: [
    LayoutComponent, HeaderComponent, FooterComponent, AccountsSideBarComponent,
    ManageGroupsAccountsComponent, CompanyAddComponent, ConfirmModalComponent, AccountOperationsComponent,
    GroupsRecursiveListComponent, GroupsRecursiveListItemComponent, GroupAccountsListComponent, AccountFilterPipe,
    AccountAddComponent, UniqueNameDirective, ElementViewContainerRef
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    PerfectScrollbarModule.forRoot(PERFECT_SCROLLBAR_CONFIG),
    Ng2BootstrapModule.forRoot(),
    LaddaModule.forRoot({
      style: 'slide-left',
      spinnerSize: 30
    }),
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    FormWizardModule,
    SelectModule,
    Select2Module, TagsModule,
    ClickOutsideModule
  ],
  exports: [LayoutComponent, HeaderComponent, FooterComponent, LaddaModule, Ng2BootstrapModule, ToastrModule,
    BrowserAnimationsModule, AccountFilterPipe, SelectModule, Select2Module, ClickOutsideModule],
  entryComponents: [ManageGroupsAccountsComponent, CompanyAddComponent, ConfirmModalComponent, AccountOperationsComponent,
    GroupsRecursiveListComponent, GroupsRecursiveListItemComponent, GroupAccountsListComponent, AccountAddComponent]
})
export class SharedModule {
  public static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule,
      providers: []
    };
  }
}
