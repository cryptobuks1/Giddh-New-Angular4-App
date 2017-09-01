import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';
import { InvoiceSetting, InvoiceISetting, InvoiceWebhooks } from '../../models/interfaces/invoice.setting.interface';
import { AppState } from '../../store/roots';
import { Store } from '@ngrx/store';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { InvoiceActions } from '../../services/actions/invoice/invoice.actions';
import { ToasterService } from '../../services/toaster.service';
import { RazorPayDetailsResponse } from '../../models/api-models/SettingsIntegraion';
import { AccountService } from '../../services/account.service';
import { Select2OptionData } from '../../shared/theme/select2/select2.interface';
import { Observable } from 'rxjs/Observable';
import { IFlattenGroupsAccountsDetail } from '../../models/interfaces/flattenGroupsAccountsDetail.interface';

@Component({
  templateUrl: './invoice.settings.component.html',
  styleUrls: ['./invoice.setting.component.css']
})
export class InvoiceSettingComponent implements OnInit {

  public invoiceSetting: InvoiceISetting = new InvoiceISetting();
  public invoiceWebhook: InvoiceWebhooks[];
  public invoiceLastState: InvoiceISetting;
  public webhookLastState: InvoiceWebhooks[];
  public webhookIsValidate: boolean = false;
  public settingResponse: any;
  public formToSave: any;
  public proformaWebhook: InvoiceWebhooks[];
  public webhooksToSend: InvoiceWebhooks[];
  public getRazorPayDetailResponse: boolean = false;
  public razorpayObj: RazorPayDetailsResponse = new RazorPayDetailsResponse();
  public updateRazor: boolean = false;
  public accountList: any;
  public accountToSend: any = {};
  public linkAccountDropDown$: Observable<Select2OptionData[]>;
  public options: Select2Options = {
    multiple: false,
    width: '100%',
    allowClear: true,
    placeholder: 'Select to link account'
  };
  public webhookMock: any = {
    url: '',
    triggerAt: '',
    entity: 'invoice'
  };

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private store: Store<AppState>,
    private invoiceActions: InvoiceActions,
    private _toasty: ToasterService,
    private _accountService: AccountService
  ) { }

  public ngOnInit() {
    this.store.dispatch(this.invoiceActions.getInvoiceSetting());

    this.store.select(p => p.invoice.settings).takeUntil(this.destroyed$).subscribe((setting: InvoiceSetting) => {
      if (setting && setting.invoiceSettings && setting.webhooks) {
        this.settingResponse = setting;
        this.invoiceSetting = _.cloneDeep(setting.invoiceSettings);

        // using last state to compare data before dispatching action
        this.invoiceLastState = _.cloneDeep(setting.invoiceSettings);
        this.webhookLastState = _.cloneDeep(setting.webhooks);

        let webhooks = _.cloneDeep(setting.webhooks);

        // using filter to get webhooks for 'invoice' only
        this.invoiceWebhook = webhooks.filter((obj) => obj.entity === 'invoice');
        this.proformaWebhook = webhooks.filter((obj) => obj.entity === 'proforma');

        // adding blank webhook row on load
        let webhookRow = _.cloneDeep(this.webhookMock);
        this.invoiceWebhook.push(webhookRow);

        if (setting.razorPayform && !_.isEmpty(setting.razorPayform)) {
          this.razorpayObj = _.cloneDeep(setting.razorPayform);
          this.razorpayObj.password = 'YOU_ARE_NOT_ALLOWED';
          this.updateRazor = true;
          // this.razorpayObj.account.name = _.cloneDeep(setting.razorPayform.account.uniqueName) || '';
        } else {
          this.updateRazor = false;
        }

        if (this.invoiceSetting.createPaymentEntry && !this.getRazorPayDetailResponse) {
          this.store.dispatch(this.invoiceActions.getRazorPayDetail());
          this.getRazorPayDetailResponse = true;
        }
      }
    });

    // get flatten_accounts list
    this._accountService.GetFlattenAccounts('', '').takeUntil(this.destroyed$).subscribe(data => {
      if (data.status === 'success') {
        let linkAccount: Select2OptionData[] = [];
        this.accountList = _.cloneDeep(data.body.results);
        data.body.results.map(d => {
          linkAccount.push({ text: d.name, id: d.uniqueName });
        });
        this.linkAccountDropDown$ = Observable.of(linkAccount);
      }
    });
  }

  /**
   * Add New Webhook
   */
  public addNewWebhook(webhook) {
    let objToSave = _.cloneDeep(webhook);
    if (!objToSave.url || !objToSave.triggerAt) {
      this._toasty.warningToast("Last row can't be blank.");
      return false;
    } else
      if (objToSave.url && objToSave.triggerAt) {
        this.validateWebhook(objToSave);
        if (this.webhookIsValidate) {
          this.saveWebhook(objToSave);
        }
      }
  }

  /**
   * Save Webhook
   */
  public saveWebhook(webhook) {
    this.store.dispatch(this.invoiceActions.saveInvoiceWebhook(webhook));
  }

  /**
   * Delete Webhook
   */
  public deleteWebhook(webhook, index) {
    if (webhook.uniqueName) {
      this.store.dispatch(this.invoiceActions.deleteWebhook(webhook.uniqueName));
    } else {
      this.invoiceWebhook.splice(index, 1);
    }
  }

  /**
   * Update Form
   */
  public UpdateForm(form) {
    let razorpayObj: RazorPayDetailsResponse = _.cloneDeep(this.settingResponse.razorPayform) || new RazorPayDetailsResponse();
    // check whether form is updated or not
    if (!_.isEqual(form, this.invoiceLastState) || !_.isEqual(this.razorpayObj, razorpayObj)) {
      if (!_.isEqual(form, this.invoiceLastState)) {

        if (!this.invoiceWebhook[this.invoiceWebhook.length - 1].url && !this.invoiceWebhook[this.invoiceWebhook.length - 1].triggerAt) {
          this.invoiceWebhook.splice(this.invoiceWebhook.length - 1);
        }
        // perform operation to update 'invoice' webhooks
        this.mergeWebhooks(this.invoiceWebhook);

        this.formToSave = _.cloneDeep(this.settingResponse);
        this.formToSave.invoiceSettings = _.cloneDeep(this.invoiceSetting);
        this.formToSave.webhooks = _.cloneDeep(this.webhooksToSend);
        delete this.formToSave.razorPayform; // delete razorPay before sending form
        this.store.dispatch(this.invoiceActions.updateInvoiceSetting(this.formToSave));
      }

      if (!_.isEqual(this.razorpayObj, razorpayObj) && form.createPaymentEntry) {
        this.saveRazorPay(this.razorpayObj, form);
      }
    } else {
      this._toasty.warningToast('No changes made.');
      return false;
    }
  }

  /**
   * Update RazorPay
  */

  public saveRazorPay(razorForm, form) {
    let assignAccountToRazorPay = _.cloneDeep(this.accountToSend);
    this.razorpayObj.account = assignAccountToRazorPay;
    this.razorpayObj.autoCapturePayment = true;
    this.razorpayObj.companyName = '';
    if (form.createPaymentEntry && (!this.razorpayObj.userName || !this.razorpayObj.account)) {
      this._toasty.warningToast('Please Enter Valid Key Or Uncheck Razorpay Option.');
      return false;
    }
    let razorpayObj = _.cloneDeep(this.razorpayObj);
    if (this.updateRazor) {
      delete razorpayObj.password;
      this.store.dispatch(this.invoiceActions.updateRazorPayDetail(razorpayObj));
    } else {
      this.store.dispatch(this.invoiceActions.SaveRazorPayDetail(razorpayObj));
    }
  }

  /**
   * Merge Webhook before saving Form
   */
  public mergeWebhooks(webhooks) {
    let invoiceWebhook = _.cloneDeep(webhooks);
    let result: any = _.concat(invoiceWebhook, this.proformaWebhook);
    this.webhooksToSend = result;
  }

  /**
   * Reset Form
   */
  public resetForm() {
    this.invoiceSetting = this.invoiceLastState;
  }

  /**
   * validate Webhook URL
   */
  public validateWebhook(webhook) {
    let url = /^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/;
    if (!url.test(webhook.url)) {
      this._toasty.warningToast('Invalid Webhook URL.');
    } else {
      this.webhookIsValidate = true;
    }
  }

  /**
   * Delete razor-pay detail
   */
  public deleteRazorPay() {
    this.store.dispatch(this.invoiceActions.deleteRazorPayDetail());
    this.updateRazor = false;
  }

  /**
   * select account to link with razorpay
   */
  public selectLinkAccount(data) {
    let arrOfAcc = _.cloneDeep(this.accountList);
    if (data.value) {
      let result = arrOfAcc.filter((obj) => obj.uniqueName === data.value);
      this.accountToSend.name = result[0].name;
      this.accountToSend.uniqueName = result[0].uniqueName;
    }
  }

  /**
   * verfiy Email
   */
  public verfiyEmail(emailId) {
    let email = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (email.test(emailId)) {
      this.store.dispatch(this.invoiceActions.updateInvoiceEmail(emailId));
    } else {
      this._toasty.warningToast('Invalid Email Address.');
      return false;
    }
  }

  /**
   * delete Email
   */
  public deleteEmail(emailId) {
    if (!emailId) {
      return false;
    } else {
      let emailTodelete = _.cloneDeep(emailId);
      emailTodelete = null;
      this.store.dispatch(this.invoiceActions.deleteInvoiceEmail(emailTodelete));
    }
  }
}
