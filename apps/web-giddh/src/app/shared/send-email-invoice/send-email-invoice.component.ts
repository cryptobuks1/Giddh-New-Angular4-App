import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { VoucherTypeEnum } from '../../models/api-models/Sales';

@Component({
  selector: 'app-send-email-invoice-component',
  templateUrl: './send-email-invoice.component.html',
  styleUrls: ['./send-email-invoice.component.scss']
})

export class SendEmailInvoiceComponent implements OnInit, OnDestroy {
  @Input() voucherType: VoucherTypeEnum;
  @Output() public successEvent: EventEmitter<string | { email: string, invoiceType: string[] }> = new EventEmitter<string | { email: string, invoiceType: string[] }>();
  @Output() public cancelEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
  public emailAddresses: string = '';
  public invoiceType: string[] = [];
  public isTransport: boolean = false;
  public isCustomer: boolean = false;

  constructor() {
  }

  ngOnInit() {
  }

  invoiceTypeChanged(event) {
    let val = event.target.value;
    if (event.target.checked) {
      this.invoiceType.push(val);
    } else {
      this.invoiceType = this.invoiceType.filter(f => f !== val);
    }
  }

  sendEmail() {
    if ([VoucherTypeEnum.estimate, VoucherTypeEnum.generateEstimate, VoucherTypeEnum.proforma, VoucherTypeEnum.generateProforma].includes(this.voucherType)) {
      this.successEvent.emit(this.emailAddresses);
    } else {
      this.successEvent.emit({email: this.emailAddresses, invoiceType: this.invoiceType});
    }
    this.cancel();
  }

  cancel() {
    this.cancelEvent.emit(true);
    this.resetModal();
  }

  resetModal() {
    this.emailAddresses = '';
    this.invoiceType = [];
    this.isTransport = false;
    this.isCustomer = false;
  }

  ngOnDestroy(): void {
  }
}