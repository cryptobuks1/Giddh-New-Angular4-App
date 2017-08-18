import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';
import * as _ from 'lodash';
import { NgForm } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AppState } from '../../store/roots';
import { InvoiceActions } from '../../services/actions/invoice/invoice.actions';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { PreviewAndGenerateInvoiceResponse, GetInvoiceTemplateDetailsResponse, ISection } from '../../models/api-models/Invoice';
import { InvoiceState } from '../../store/Invoice/invoice.reducer';
import { InvoiceService } from '../../services/invoice.service';

@Component({
  styleUrls: ['./invoice.create.component.css'],
  selector: 'invoice-create',
  templateUrl: './invoice.create.component.html'
})

export class InvoiceCreateComponent implements OnInit {

  public invFormData: PreviewAndGenerateInvoiceResponse;
  public tableCond: ISection;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  private invTempCond: GetInvoiceTemplateDetailsResponse;

  constructor(
    private store: Store<AppState>,
    private invoiceActions: InvoiceActions,
    private invoiceService: InvoiceService
  ) {}

  public ngOnInit() {
    this.store.select(p => p.invoice.generate.invoiceData)
      .takeUntil(this.destroyed$)
      .distinctUntilChanged()
      .subscribe((o: PreviewAndGenerateInvoiceResponse) => {
        if (o) {
          this.invFormData = _.cloneDeep(o);
        }else {
          this.invFormData = new PreviewAndGenerateInvoiceResponse();
        }
      }
    );

    this.store.select(p => p.invoice.generate.invoiceTemplateConditions)
      .takeUntil(this.destroyed$)
      .distinctUntilChanged()
      .subscribe((o) => {
        if (o) {
          this.invTempCond =  _.cloneDeep(o);
          // find table condition in object and assign it to local var
          let obj =  _.cloneDeep(o);
          this.tableCond = _.find(obj.sections, ['sectionName', 'table']);
        }
      }
    );
  }

  public onSubmitInvoiceForm(f: NgForm) {
    console.log (f, 'onSubmitInvoiceForm');
    console.log (this.invFormData, 'actual class object');
  }
}
