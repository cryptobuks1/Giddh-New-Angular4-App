
import { Template } from '../models/api-models/invoice';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { INVOICE_API } from './apiurls/invoice';
import { HttpWrapperService } from './httpWrapper.service';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from '../store/roots';
import { map } from 'rxjs/operator/map';
import { BaseResponse } from '../models/api-models/BaseResponse';
import { UserDetails } from '../models/api-models/loginModels';
import { HandleCatch } from './catchManager/catchmanger';


@Injectable()
export class InvoiceTemplatesService {
  private companyUniqueName: string;
  private user: UserDetails;

  constructor(public _http: HttpWrapperService, public _router: Router, private store: Store<AppState>) {
  }

  public getTemplates(): Observable<Template> {
    this.store.take(1).subscribe(s => {
      if (s.session.user) {
        this.user = s.session.user.user;
      }
      this.companyUniqueName = s.session.companyUniqueName;
    });
    return this._http.get(INVOICE_API.GET_USER_TEMPLATES).map((res) => {
      let data: Template = res.json();
      console.log('API RESPONSE', data);
      return data;
    }).catch((e) => HandleCatch<Template, string>(e));
  }

  public getTopMargin(): Observable<number> {
    return this.store.select((state: AppState) => state.invtemp.templateMeta.topMargin);
  }

  public getBottomMargin(): Observable<number> {
    return this.store.select((state: AppState) => state.invtemp.templateMeta.bottomMargin);
  }

  public getLeftMargin(): Observable<number> {
    return this.store.select((state: AppState) => state.invtemp.templateMeta.leftMargin);
  }

  public getRightMargin(): Observable<number> {
    return this.store.select((state: AppState) => state.invtemp.templateMeta.rightMargin);
  }

  public getFontFamily(): Observable<string> {
    return this.store.select((state: AppState) => state.invtemp.templateMeta.font);
  }

  public getColor(): Observable<string> {
    return this.store.select((state: AppState) => state.invtemp.templateMeta.color);
  }

  public getCompanyName(): Observable<string> {
    return this.store.select((state: AppState) => state.invtemp.templateMeta.companyName);
  }

  public getGSTIN(): Observable<string> {
    return this.store.select((state: AppState) => state.invtemp.templateMeta.GSTIN);
  }

  public getPAN(): Observable<string> {
    return this.store.select((state: AppState) => state.invtemp.templateMeta.PAN);
  }

  public getAddress(): Observable<string> {
    return this.store.select((state: AppState) => state.invtemp.templateMeta.address);
  }

  public getInvoiceDate(): Observable<string> {
    return this.store.select((state: AppState) => state.invtemp.templateMeta.invoiceDate);
  }

  public getInvoiceNo(): Observable<string> {
    return this.store.select((state: AppState) => state.invtemp.templateMeta.invoiceNumber);
  }

  public getShippingDate(): Observable<string> {
    return this.store.select((state: AppState) => state.invtemp.templateMeta.shippingDate);
  }
  public getShippingVia(): Observable<string> {
    return this.store.select((state: AppState) => state.invtemp.templateMeta.shippingVia);
  }

  public getShippingNo(): Observable<string> {
    return this.store.select((state: AppState) => state.invtemp.templateMeta.shippingNo);
  }

  public getTrackingDate(): Observable<string> {
    return this.store.select((state: AppState) => state.invtemp.templateMeta.trackingDate);
  }

  public getTrackingNumber(): Observable<string> {
    return this.store.select((state: AppState) => state.invtemp.templateMeta.trackingNumber);
  }

  public getCustomerName(): Observable<string> {
    return this.store.select((state: AppState) => state.invtemp.templateMeta.customerName);
  }

  public getCustomerEmail(): Observable<string> {
    return this.store.select((state: AppState) => state.invtemp.templateMeta.customerEmail);
  }

  public getCustomerMobileNo(): Observable<string> {
    return this.store.select((state: AppState) => state.invtemp.templateMeta.customerMobileNumber);
  }

  public getDueDate(): Observable<string> {
    return this.store.select((state: AppState) => state.invtemp.templateMeta.dueDate);
  }

  public getBillingAddress(): Observable<string> {
    return this.store.select((state: AppState) => state.invtemp.templateMeta.billingAddress);
  }

  public getBillingState(): Observable<string> {
    return this.store.select((state: AppState) => state.invtemp.templateMeta.billingState);
  }

  public getBillingGSTIN(): Observable<string> {
    return this.store.select((state: AppState) => state.invtemp.templateMeta.billingGstin);
  }

  public getShippingAddress(): Observable<string> {
    return this.store.select((state: AppState) => state.invtemp.templateMeta.shippingAddress);
  }

  public getShippingState(): Observable<string> {
    return this.store.select((state: AppState) => state.invtemp.templateMeta.shippingDate);
  }

  public getShippingGSTIN(): Observable<string> {
    return this.store.select((state: AppState) => state.invtemp.templateMeta.shippinGstin);
  }

  public getCustomField1(): Observable<string> {
    return this.store.select((state: AppState) => state.invtemp.templateMeta.customField1);
  }

  public getCustomField2(): Observable<string> {
    return this.store.select((state: AppState) => state.invtemp.templateMeta.customField2);
  }

  public getCustomField3(): Observable<string> {
    return this.store.select((state: AppState) => state.invtemp.templateMeta.customField3);
  }

  public getFormNameInvoice(): Observable<string> {
    return this.store.select((state: AppState) => state.invtemp.templateMeta.formNameInvoice);
  }

  public getFormNameTaxInvoice(): Observable<string> {
    return this.store.select((state: AppState) => state.invtemp.templateMeta.formNameTaxInvoice);
  }

  public getFormNameTaxInvoiceFlag(): Observable<boolean> {
    return this.store.select((state: AppState) => state.invtemp.templateMeta.setInvoiceFlag);
  }

  public getSnoLabel(): Observable<string> {
    return this.store.select((state: AppState) => state.invtemp.templateMeta.sNoLabel);
  }

  public getDateLabel(): Observable<string> {
    return this.store.select((state: AppState) => state.invtemp.templateMeta.dateLabel);
  }

  public getItemLabel(): Observable<string> {
    return this.store.select((state: AppState) => state.invtemp.templateMeta.itemLabel);
  }

  public getHsnSacLabel(): Observable<string> {
    return this.store.select((state: AppState) => state.invtemp.templateMeta.hsnSacLabel);
  }

  public getItemCodeLabel(): Observable<string> {
    return this.store.select((state: AppState) => state.invtemp.templateMeta.itemCodeLabel);
  }

  public getDescLabel(): Observable<string> {
    return this.store.select((state: AppState) => state.invtemp.templateMeta.descLabel);
  }

  public getRateLabel(): Observable<string> {
    return this.store.select((state: AppState) => state.invtemp.templateMeta.rateLabel);
  }

  public getDiscountLabel(): Observable<string> {
    return this.store.select((state: AppState) => state.invtemp.templateMeta.discountLabel);
  }

  public getTotalLabel(): Observable<string> {
    return this.store.select((state: AppState) => state.invtemp.templateMeta.totalLabel);
  }

  public getTaxableValueLabel(): Observable<string> {
    return this.store.select((state: AppState) => state.invtemp.templateMeta.taxableValueLabel);
  }

  public getTaxLabel(): Observable<string> {
    return this.store.select((state: AppState) => state.invtemp.templateMeta.taxLabel);
  }

  public getQuantityLabel(): Observable<string> {
    return this.store.select((state: AppState) => state.invtemp.templateMeta.quantityLabel);
  }
  public getMessage1(): Observable<string> {
    return this.store.select((state: AppState) => state.invtemp.templateMeta.message1);
  }
  public getMessage2(): Observable<string> {
    return this.store.select((state: AppState) => state.invtemp.templateMeta.message2);
  }
  public getTaxableAmount(): Observable<string> {
    return this.store.select((state: AppState) => state.invtemp.templateMeta.taxableAmount);
  }
  public getTotalTax(): Observable<string> {
    return this.store.select((state: AppState) => state.invtemp.templateMeta.totalTax);
  }
  public getOtherDeduction(): Observable<string> {
    return this.store.select((state: AppState) => state.invtemp.templateMeta.otherDeduction);
  }
  public getTotal(): Observable<string> {
    return this.store.select((state: AppState) => state.invtemp.templateMeta.total);
  }
  public getTotalInWords(): Observable<string> {
    return this.store.select((state: AppState) => state.invtemp.templateMeta.totalInWords);
  }
  public getThanks(): Observable<string> {
    return this.store.select((state: AppState) => state.invtemp.templateMeta.thanks);
  }
  public getImageSignature(): Observable<string> {
    return this.store.select((state: AppState) => state.invtemp.templateMeta.imageSignature);
  }
  public getSlogan(): Observable<string> {
    return this.store.select((state: AppState) => state.invtemp.templateMeta.slogan);
  }
}
