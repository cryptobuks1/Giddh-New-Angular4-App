import { Component, EventEmitter, forwardRef, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import * as moment from 'moment/moment';
import * as _ from '../../lodash-optimized';
import { TaxResponse } from '../../models/api-models/Company';
import { ITaxDetail } from '../../models/interfaces/tax.interface';
import { ReplaySubject } from 'rxjs';
import { giddhRoundOff } from '../../shared/helpers/helperFunctions';

export const TAX_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  // tslint:disable-next-line:no-forward-ref
  useExisting: forwardRef(() => TaxControlComponent),
  multi: true
};

export class TaxControlData {
  public name?: string;
  public uniqueName: string;
  public amount?: number;
  public isChecked?: boolean;
  public isDisabled?: boolean;
  public type?: string;
}

@Component({
  selector: 'tax-control',
  templateUrl: 'tax-control.component.html',
  styles: [`
    .single-item .dropdown-menu {
      height: 50px !important;
    }

    :host .dropdown-menu {
      min-width: 200px;
      height: inherit;
      padding: 0;
      overflow: auto;
    }

    .fakeLabel {
      cursor: pointer;
      padding: 5px 10px;
      line-height: 24px;
    }

    :host .fake-disabled-label {
      cursor: not-allowed;
      opacity: .5;
    }

    .multi-select input.form-control {
      background-image: unset !important;
    }

    .multi-select .caret {
      display: block !important;
    }

    #tax-control-multi-select.multi-select input.form-control[readonly] {
      background-image: unset !important;
    }
  `],
  providers: [TAX_CONTROL_VALUE_ACCESSOR]
})
export class TaxControlComponent implements OnInit, OnDestroy, OnChanges {
  @Input() public date: string;
  @Input() public taxes: TaxResponse[];
  @Input() public applicableTaxes: string[] = [];
  @Input() public taxRenderData: TaxControlData[];
  @Input() public showHeading: boolean = true;
  @Input() public showTaxPopup: boolean = false;
  @Input() public totalForTax: number = 0;
  @Input() public rootClass: string = 'ledger-panel';

  @Input() public customTaxTypesForTaxFilter: string[] = [];
  @Input() public exceptTaxTypes: string[] = [];
  @Input() public allowedSelection: number = 0;
  @Input() public allowedSelectionOfAType: Array<{ type: string[], count: number }>;
  @Input() public maskInput: string;
  @Input() public prefixInput: string;
  @Input() public suffixInput: string;

  @Output() public isApplicableTaxesEvent: EventEmitter<boolean> = new EventEmitter();
  @Output() public taxAmountSumEvent: EventEmitter<number> = new EventEmitter();
  @Output() public selectedTaxEvent: EventEmitter<string[]> = new EventEmitter();
  @Output() public hideOtherPopups: EventEmitter<boolean> = new EventEmitter<boolean>();

  public taxSum: number = 0;
  public taxTotalAmount: number = 0;
  private selectedTaxes: string[] = [];
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor() {
    //
  }

  public ngOnInit(): void {
  }

  public ngOnChanges(changes: SimpleChanges) {
    // change
    if ('date' in changes && changes.date.currentValue !== changes.date.previousValue) {
      if (moment(changes['date'].currentValue, 'DD-MM-YYYY').isValid()) {
        this.taxSum = 0;
        this.prepareTaxObject();
        this.change();
      }
    }

    if ('applicableTaxes' in changes && (Array.isArray(changes.applicableTaxes.currentValue)) &&
      _.difference(changes.applicableTaxes.currentValue, changes.applicableTaxes.previousValue).length > -1) {
      this.prepareTaxObject();
      this.change();
    }

    if (changes['totalForTax'] && changes['totalForTax'].currentValue !== changes['totalForTax'].previousValue) {
      this.taxTotalAmount = giddhRoundOff(((this.totalForTax * this.taxSum) / 100), 2);
    }
  }

  /**
   * prepare taxObject as per needed
   */
  public prepareTaxObject() {
    if (this.customTaxTypesForTaxFilter && this.customTaxTypesForTaxFilter.length) {
      this.taxes = this.taxes.filter(f => this.customTaxTypesForTaxFilter.includes(f.taxType));
    }

    if (this.exceptTaxTypes && this.exceptTaxTypes.length) {
      this.taxes = this.taxes.filter(f => !this.exceptTaxTypes.includes(f.taxType));
    }

    this.taxes.map(tx => {
      let index = this.taxRenderData.findIndex(f => f.uniqueName === tx.uniqueName);

      // if tax is already prepared then only check if it's checked or not on basis of applicable taxes
      if (index > -1) {
        this.taxRenderData[index].isChecked = this.taxRenderData[index].isChecked ? true : this.applicableTaxes.length ? this.applicableTaxes.some(s => s === tx.uniqueName) : false;
      } else {

        let taxObj = new TaxControlData();
        taxObj.name = tx.name;
        taxObj.uniqueName = tx.uniqueName;
        taxObj.type = tx.taxType;

        if (this.date) {
          let taxObject = _.orderBy(tx.taxDetail, (p: ITaxDetail) => {
            return moment(p.date, 'DD-MM-YYYY');
          }, 'desc');
          let exactDate = taxObject.filter(p => moment(p.date, 'DD-MM-YYYY').isSame(moment(this.date, 'DD-MM-YYYY')));
          if (exactDate.length > 0) {
            taxObj.amount = exactDate[0].taxValue;
          } else {
            let filteredTaxObject = taxObject.filter(p => moment(p.date, 'DD-MM-YYYY') < moment(this.date, 'DD-MM-YYYY'));
            if (filteredTaxObject.length > 0) {
              taxObj.amount = filteredTaxObject[0].taxValue;
            } else {
              taxObj.amount = 0;
            }
          }
        } else {
          taxObj.amount = tx.taxDetail[0].taxValue;
        }

        taxObj.isChecked = this.applicableTaxes.length ? this.applicableTaxes.some(s => s === tx.uniqueName) : false;
        taxObj.isDisabled = false;
        this.taxRenderData.push(taxObj);
      }
    });
  }

  public trackByFn(index) {
    return index; // or item.id
  }

  /**
   * hide menus on outside click of span
   */
  public toggleTaxPopup(action: any) {
    console.log(action);
    this.showTaxPopup = action;
  }

  public ngOnDestroy() {
    this.taxAmountSumEvent.unsubscribe();
    this.isApplicableTaxesEvent.unsubscribe();
    this.selectedTaxEvent.unsubscribe();
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  /**
   * select/deselect tax checkbox
   */
  public change() {
    this.selectedTaxes = [];
    this.taxSum = this.calculateSum();
    this.taxTotalAmount = giddhRoundOff(((this.totalForTax * this.taxSum) / 100), 2);
    this.selectedTaxes = this.generateSelectedTaxes();

    if (this.allowedSelection > 0) {
      if (this.selectedTaxes.length >= this.allowedSelection) {
        this.taxRenderData.map(m => {
          m.isDisabled = !m.isChecked;
          return m;
        });
      } else {
        this.taxRenderData.map(m => {
          m.isDisabled = m.isDisabled ? false : m.isDisabled;
          return m;
        });
      }
    }

    if (this.allowedSelectionOfAType && this.allowedSelectionOfAType.length) {
      this.allowedSelectionOfAType.forEach(ast => {
        let selectedTaxes = this.taxRenderData.filter(f => f.isChecked).filter(t => ast.type.includes(t.type));

        if (selectedTaxes.length >= ast.count) {
          this.taxRenderData.map((m => {
            if (ast.type.includes(m.type) && !m.isChecked) {
              m.isDisabled = true;
            }
            return m;
          }));
        } else {
          this.taxRenderData.map((m => {
            if (ast.type.includes(m.type) && m.isDisabled) {
              m.isDisabled = false;
            }
            return m;
          }));
        }
      });
    }

    this.taxAmountSumEvent.emit(this.taxSum);
    this.selectedTaxEvent.emit(this.selectedTaxes);

    // let diff: boolean;
    // if (this.selectedTaxes.length > 0) {
    //   diff = _.difference(this.selectedTaxes, this.applicableTaxes).length > 0;
    // } else {
    //   diff = this.applicableTaxes.length > 0;
    // }
    //
    // if (diff) {
    //   this.isApplicableTaxesEvent.emit(false);
    // } else {
    //   this.isApplicableTaxesEvent.emit(true);
    // }
  }

  public onFocusLastDiv(el) {
    el.stopPropagation();
    el.preventDefault();
    if (!this.showTaxPopup) {
      this.showTaxPopup = true;
      this.hideOtherPopups.emit(true);
      return;
    }
    let focussableElements = `.${this.rootClass} input[type=text]:not([disabled]),.${this.rootClass} [tabindex]:not([disabled]):not([tabindex="-1"])`;
    // if (document.activeElement && document.activeElement.form) {
    let focussable = Array.prototype.filter.call(document.querySelectorAll(focussableElements),
      (element) => {
        // check for visibility while always include the current activeElement
        return element.offsetWidth > 0 || element.offsetHeight > 0 || element === document.activeElement
      });
    let index = focussable.indexOf(document.activeElement);
    if (index > -1) {
      let nextElement = focussable[index + 1] || focussable[0];
      nextElement.focus();
    }
    this.toggleTaxPopup(false);
    return false;
  }

  private isTaxApplicable(tax): boolean {
    const today = moment(moment().format('DD-MM-YYYY'), 'DD-MM-YYYY', true).valueOf();
    let isApplicable = false;
    _.each(tax.taxDetail, (det: any) => {
      if (today >= moment(det.date, 'DD-MM-YYYY', true).valueOf()) {
        return isApplicable = true;
      }
    });
    return isApplicable;
  }

  /**
   * calculate sum of selected tax amount
   * @returns {number}
   */
  private calculateSum() {
    return this.taxRenderData.reduce((pv, cv) => {
      return cv.isChecked ? pv + cv.amount : pv;
    }, 0);
  }

  /**
   * generate array of selected tax uniqueName
   * @returns {string[]}
   */
  private generateSelectedTaxes(): string[] {
    return this.taxRenderData.filter(p => p.isChecked).map(p => p.uniqueName);
  }
}
