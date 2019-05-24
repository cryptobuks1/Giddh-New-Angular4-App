import { Observable, ReplaySubject } from 'rxjs';

import { takeUntil } from 'rxjs/operators';
import { GIDDH_DATE_FORMAT } from 'apps/web-giddh/src/app/shared/helpers/defaultDateFormat';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import * as _ from '../../lodash-optimized';
import * as moment from 'moment/moment';
import { CompanyCashFreeSettings, CompanyEmailSettings, InvoiceSetting, InvoiceSettings, InvoiceWebhooks, ProformaSettings } from '../../models/interfaces/invoice.setting.interface';
import { AppState } from '../../store';
import { select, Store } from '@ngrx/store';
import { InvoiceActions } from '../../actions/invoice/invoice.actions';
import { ToasterService } from '../../services/toaster.service';
import { RazorPayDetailsResponse } from '../../models/api-models/SettingsIntegraion';
import { IOption } from '../../theme/ng-select/option.interface';
import { IFlattenAccountsResultItem } from '../../models/interfaces/flattenAccountsResultItem.interface';

const PaymentGateway = [
  {value: 'razorpay', label: 'razorpay'},
  {value: 'cashfree', label: 'cashfree'}
];

@Component({
  selector: 'app-invoice-setting',
  templateUrl: './invoice.settings.component.html',
  styleUrls: ['./invoice.setting.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvoiceSettingComponent implements OnInit, OnDestroy {

  public invoiceSetting: InvoiceSettings = new InvoiceSettings();
  public proformaSetting: ProformaSettings = new ProformaSettings();
  public invoiceWebhook: InvoiceWebhooks[];
  public invoiceLastState: InvoiceSettings;
  public webhookLastState: InvoiceWebhooks[];
  public webhookIsValidate: boolean = false;
  public settingResponse: any;
  public formToSave: any;
  public proformaWebhook: InvoiceWebhooks[];
  public webhooksToSend: InvoiceWebhooks[];
  public getRazorPayDetailResponse: boolean = false;
  public razorpayObj: RazorPayDetailsResponse = new RazorPayDetailsResponse();
  public companyEmailSettings: CompanyEmailSettings = new CompanyEmailSettings();
  public updateRazor: boolean = false;
  public accountList: any;
  public accountToSend: any = {};
  public linkAccountDropDown: IOption[] = [];
  public originalEmail: string;
  public isEmailChanged: boolean = false;
  public webhookMock: any = {
    url: '',
    triggerAt: '',
    entity: 'invoice'
  };
  public showDatePicker: boolean = false;
  public moment = moment;
  public isAutoPaidOn: boolean;
  public companyCashFreeSettings: CompanyCashFreeSettings = new CompanyCashFreeSettings();
  public paymentGatewayList: IOption[] = PaymentGateway;
  public isLockDateSet: boolean = false;
  public lockDate: Date = new Date();
  public flattenAccounts$: Observable<IFlattenAccountsResultItem[]>;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private store: Store<AppState>,
    private invoiceActions: InvoiceActions,
    private _toasty: ToasterService,
  ) {
    this.flattenAccounts$ = this.store.pipe(select(s => s.general.flattenAccounts), takeUntil(this.destroyed$));
  }

  public ngOnInit() {
    this.store.dispatch(this.invoiceActions.getInvoiceSetting());
    this.initSettingObj();

    this.flattenAccounts$.subscribe(data => {
      let linkAccount: IOption[] = [];
      if (data) {
        data.forEach(f => {
          linkAccount.push({label: f.name, value: f.uniqueName});
        });
        this.linkAccountDropDown = linkAccount;
      }
    });
  }

  public initSettingObj() {
    this.store.pipe(select(p => p.invoice.settings), takeUntil(this.destroyed$)).subscribe((setting: InvoiceSetting) => {
      if (setting && setting.invoiceSettings && setting.webhooks) {

        this.originalEmail = _.cloneDeep(setting.invoiceSettings.email);

        this.settingResponse = setting;
        this.invoiceSetting = _.cloneDeep(setting.invoiceSettings);
        this.proformaSetting = _.cloneDeep(setting.proformaSettings);
        this.isAutoPaidOn = this.invoiceSetting.autoPaid === 'runtime';

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

        if (setting.companyEmailSettings) {
          this.companyEmailSettings.sendThroughGmail = _.cloneDeep(setting.companyEmailSettings.sendThroughGmail);
        } else {
          this.companyEmailSettings.sendThroughGmail = false;
        }

        if (this.invoiceSetting.lockDate) {
          this.isLockDateSet = true;
          this.lockDate = moment(this.invoiceSetting.lockDate, 'DD-MM-YYYY').toDate();
        } else {
          this.isLockDateSet = false;
        }
        this.companyCashFreeSettings = _.cloneDeep(setting.companyCashFreeSettings);

      } else if (!setting || !setting.webhooks) {
        this.store.dispatch(this.invoiceActions.getInvoiceSetting());
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
    } else if (objToSave.url && objToSave.triggerAt) {
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
      this.initSettingObj();
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
    // if (!_.isEqual(form, this.invoiceLastState)) {
    // if (!_.isEqual(form, this.invoiceLastState)) {

    if (!this.invoiceWebhook[this.invoiceWebhook.length - 1].url && !this.invoiceWebhook[this.invoiceWebhook.length - 1].triggerAt) {
      this.invoiceWebhook.splice(this.invoiceWebhook.length - 1);
    }
    // perform operation to update 'invoice' webhooks
    this.mergeWebhooks(this.invoiceWebhook);

    this.formToSave = _.cloneDeep(this.settingResponse);
    this.formToSave.invoiceSettings = _.cloneDeep(this.invoiceSetting);
    this.formToSave.webhooks = _.cloneDeep(this.webhooksToSend);
    this.formToSave.companyEmailSettings = {
      sendThroughGmail: _.cloneDeep(form.sendThroughGmail) ? _.cloneDeep(form.sendThroughGmail) : false,
      sendThroughSendgrid: false
    };
    delete this.formToSave.sendThroughGmail;
    delete this.formToSave.razorPayform; // delete razorPay before sending form
    // if (this.formToSave.invoiceSettings.lockDate instanceof Date) {
    //   this.formToSave.invoiceSettings.lockDate = moment(this.formToSave.invoiceSettings.lockDate).format(GIDDH_DATE_FORMAT);
    // } else {
    //   this.formToSave.invoiceSettings.lockDate = null;
    // }

    if (this.isAutoPaidOn) {
      this.formToSave.invoiceSettings.autoPaid = 'runtime';
    } else {
      this.formToSave.invoiceSettings.autoPaid = 'never';
    }
    this.formToSave.companyCashFreeSettings = _.cloneDeep(this.companyCashFreeSettings);
    this.store.dispatch(this.invoiceActions.updateInvoiceSetting(this.formToSave));
    // }

    if (!_.isEqual(this.razorpayObj, razorpayObj) && form.createPaymentEntry) {
      this.saveRazorPay(this.razorpayObj, form);
    }
    // } else {
    //   this._toasty.warningToast('No changes made.');
    //   return false;
    // }
  }

  /**
   * Update RazorPay
   */

  public saveRazorPay(razorForm, form) {
    this.razorpayObj.account = _.cloneDeep(this.accountToSend);
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
    this.webhooksToSend = _.concat(invoiceWebhook, this.proformaWebhook);
  }

  /**
   * Reset Form
   */
  public resetForm() {
    // this.invoiceSetting = this.invoiceLastState;
    this.initSettingObj();
  }

  /**
   * validate Webhook URL
   */
  public validateWebhook(webhook) {
    let url = /^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,5}[.]{0,1}/;
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
    let email = new RegExp(/[a-z0-9!#$%&'*+=?^_{|}~-]+(?:.[a-z0-9!#$%&’*+=?^_{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g);
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

  /**
   * checkDueDays
   */
  public checkDueDays(value: number, indx: number, flag: string) {
    if (indx !== null) {
      if (indx > -1 && value > 90 && flag === 'length') {
        let webhooks = _.cloneDeep(this.invoiceWebhook);
        webhooks[indx].triggerAt = 90;
        this.invoiceWebhook = webhooks;
      }
      if (indx > -1 && isNaN(value) && flag === 'alpha') {
        let webhooks = _.cloneDeep(this.invoiceWebhook);
        webhooks[indx].triggerAt = Number(String(webhooks[indx].triggerAt).replace(/\D/g, '')) !== 0 ? Number(String(webhooks[indx].triggerAt).replace(/\D/g, '')) : null;
        this.invoiceWebhook = webhooks;
      }
    }
  }

  /**
   * onChangeEmail
   */
  public onChangeEmail(email: string) {
    this.isEmailChanged = email !== this.originalEmail;
  }

  /**
   * validateDefaultDueDate
   */
  public validateDefaultDueDate(defaultDueDate: string) {
    if (defaultDueDate) {
      let invoiceSetting = _.cloneDeep(this.invoiceSetting);
      if (isNaN(Number(defaultDueDate)) && defaultDueDate.indexOf('-') === -1) {
        invoiceSetting.duePeriod = Number(defaultDueDate.replace(/\D/g, '')) !== 0 && !isNaN(Number(defaultDueDate.replace(/\D/g, ''))) ? Number(defaultDueDate.replace(/\D/g, '')) : null;
        setTimeout(() => {
          this.invoiceSetting = invoiceSetting;
        });
      }
      if (defaultDueDate.indexOf('-') !== -1 && (defaultDueDate.indexOf('-') !== defaultDueDate.lastIndexOf('-')) || defaultDueDate.indexOf('-') > 0) {
        invoiceSetting.duePeriod = Number(defaultDueDate.replace(/\D/g, ''));
        setTimeout(() => {
          this.invoiceSetting = invoiceSetting;
        });
      }
      if (String(defaultDueDate).length > 3) {
        if (defaultDueDate.indexOf('-') !== -1) {
          invoiceSetting.duePeriod = Number(String(defaultDueDate).substring(0, 4));
        } else {
          invoiceSetting.duePeriod = Number(String(defaultDueDate).substring(0, 3));
        }
        setTimeout(() => {
          this.invoiceSetting = invoiceSetting;
        });
      }
    }
  }

  /**
   * setInvoiceLockDate
   */
  public setInvoiceLockDate(date) {
    this.invoiceSetting.lockDate = moment(date).format(GIDDH_DATE_FORMAT);
    this.showDatePicker = !this.showDatePicker;
  }

  public onLockDateBlur(ev) {
    this.isLockDateSet = !!ev.target.value;
  }

  public ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
