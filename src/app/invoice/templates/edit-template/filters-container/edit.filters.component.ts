import { Component } from '@angular/core';

@Component({
  selector: 'edit-template-filters',
  templateUrl: 'edit.filters.component.html',
  styles: [`
    .active {
      background: #fff !important;
      color: #ff5f00 !important;
    }
  `]
})

export class EditFiltersContainersComponent {

  public ifDesignSelected: boolean = true;
  public ifContentSelected: boolean = false;
  public ifEmailSelected: boolean = false;

  constructor() {
    this.openTab('design');
  }

  public openTab(tab) {
    if (tab === 'design') {
      this.ifDesignSelected = true;
      this.ifContentSelected = false;
      this.ifEmailSelected = false;
    }

    if (tab === 'content') {
      this.ifDesignSelected = false;
      this.ifContentSelected = true;
      this.ifEmailSelected = false;
    }

    if (tab === 'email') {
      this.ifDesignSelected = false;
      this.ifContentSelected = false;
      this.ifEmailSelected = true;
    }
  }
  // public selectTemplate() {
  //   this.ifTemplateSelected = true;
  //   this.ifLogoSelected = false;
  //   this.ifColorSelected = false;
  //   this.ifPrintSelected = false;
  //   this.ifFontSelected = false;
  // }
  //
  // public selectLogo() {
  //   this.ifLogoSelected = true;
  //   this.ifColorSelected = false;
  //   this.ifPrintSelected = false;
  //   this.ifFontSelected = false;
  //   this.ifTemplateSelected = false;
  // }
  //
  // public selectColor() {
  //   this.ifColorSelected = true;
  //   this.ifLogoSelected = false;
  //   this.ifPrintSelected = false;
  //   this.ifFontSelected = false;
  //   this.ifTemplateSelected = false;
  // }
  // public selectFonts() {
  //   this.ifFontSelected = true;
  //   this.ifColorSelected = false;
  //   this.ifLogoSelected = false;
  //   this.ifPrintSelected = false;
  //   this.ifTemplateSelected = false;
  // }
  //
  // public printSettings() {
  //   this.ifPrintSelected = true;
  //   this.ifFontSelected = false;
  //   this.ifColorSelected = false;
  //   this.ifLogoSelected = false;
  //   this.ifTemplateSelected = false;
  // }
}
