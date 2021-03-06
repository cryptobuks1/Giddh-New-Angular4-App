import { IELedgerResponse, IELedgerTransaction, TransactionsResponse } from '../models/api-models/Ledger';
import { Observable } from 'rxjs';
import { AccountResponse } from '../models/api-models/Account';
import { ITransactionItem } from '../models/interfaces/ledger.interface';
import * as moment from 'moment/moment';
import { IFlattenAccountsResultItem } from '../models/interfaces/flattenAccountsResultItem.interface';
import * as uuid from 'uuid';
import { cloneDeep, forEach, remove } from '../lodash-optimized';
import { GroupsWithAccountsResponse } from '../models/api-models/GroupsWithAccounts';
import { INameUniqueName } from '../models/api-models/Inventory';
import { underStandingTextData } from './underStandingTextData';
import { IOption } from '../theme/ng-virtual-select/sh-options.interface';
import { LedgerDiscountClass } from '../models/api-models/SettingsDiscount';

export class LedgerVM {
  public groupsArray$: Observable<GroupsWithAccountsResponse[]>;
  public activeAccount$: Observable<AccountResponse>;
  public transactionData$: Observable<TransactionsResponse>;
  public flattenAccountListStream$: Observable<IFlattenAccountsResultItem[]>;
  public selectedTxnUniqueName: string;
  public currentTxn: ITransactionItem;
  public currentBlankTxn: TransactionVM;
  public currentPage: number;
  public flattenAccountList: Observable<IOption[]>;
  public showNewLedgerPanel: boolean = false;
  public noAccountChosenForNewEntry: boolean;
  public selectedAccount: IFlattenAccountsResultItem = null;
  public today: Date = new Date();
  public fromDate: Date;
  public toDate: Date;
  public format: string = 'YYYY-MM-DD';
  public formatPlaceholder: string = 'dd-mm-yyyy';
  public accountUnq: string = '';
  public blankLedger: BlankLedgerVM;
  public dateMask = [/\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, '-', /\d/, /\d/];
  // public datePipe = createAutoCorrectedDatePipe('dd-mm-yyyy');
  public showTaxationDiscountBox: boolean = false;
  public ledgerUnderStandingObj = {
    accountType: '',
    text: {
      cr: '',
      dr: ''
    },
    balanceText: {
      cr: '',
      dr: ''
    }
  };
  // bank transaction related
  public showEledger: boolean = false;
  public bankTransactionsData: BlankLedgerVM[] = [];
  public selectedBankTxnUniqueName: string;
  public showBankLedgerPanel: boolean = false;
  public currentBankEntry: BlankLedgerVM;
  public reckoningDebitTotal: number = 0;
  public reckoningCreditTotal: number = 0;

  constructor() {
    this.noAccountChosenForNewEntry = false;
    this.blankLedger = {
      transactions: [
        {
          id: uuid.v4(),
          amount: 0,
          particular: '',
          type: 'DEBIT',
          taxes: [],
          tax: 0,
          total: 0,
          discount: 0,
          discounts: [
            this.staticDefaultDiscount()
          ],
          selectedAccount: null,
          applyApplicableTaxes: true,
          isInclusiveTax: true,
          isChecked: false
        },
        {
          id: uuid.v4(),
          amount: 0,
          particular: '',
          type: 'CREDIT',
          taxes: [],
          tax: 0,
          total: 0,
          discount: 0,
          discounts: [
            this.staticDefaultDiscount()
          ],
          selectedAccount: null,
          applyApplicableTaxes: true,
          isInclusiveTax: true,
          isChecked: false
        }],
      voucherType: 'sal',
      entryDate: moment().format('YYYY-MM-DD'),
      unconfirmedEntry: false,
      attachedFile: '',
      attachedFileName: '',
      tag: null,
      description: '',
      generateInvoice: false,
      chequeNumber: '',
      chequeClearanceDate: '',
      invoiceNumberAgainstVoucher: '',
      compoundTotal: 0
    };
  }

  public calculateReckonging(transactions: TransactionsResponse) {
    if (transactions.forwardedBalance.amount === 0) {
      let recTotal = 0;
      if (transactions.creditTotal > transactions.debitTotal) {
        recTotal = transactions.creditTotal;
      } else {
        recTotal = transactions.debitTotal;
      }
      this.reckoningCreditTotal = recTotal;
      return this.reckoningDebitTotal = recTotal;
    } else {
      if (transactions.forwardedBalance.type === 'DEBIT') {
        if ((transactions.forwardedBalance.amount + transactions.debitTotal) <= transactions.creditTotal) {
          this.reckoningCreditTotal = transactions.creditTotal;
          return this.reckoningDebitTotal = transactions.creditTotal;
        } else {
          this.reckoningCreditTotal = transactions.forwardedBalance.amount + transactions.debitTotal;
          return this.reckoningDebitTotal = transactions.forwardedBalance.amount + transactions.debitTotal;
        }
      } else {
        if ((transactions.forwardedBalance.amount + transactions.creditTotal) <= transactions.debitTotal) {
          this.reckoningCreditTotal = transactions.debitTotal;
          return this.reckoningDebitTotal = transactions.debitTotal;
        } else {
          this.reckoningCreditTotal = transactions.forwardedBalance.amount + transactions.creditTotal;
          return this.reckoningDebitTotal = transactions.forwardedBalance.amount + transactions.creditTotal;
        }
      }
    }
  }

  /**
   * prepare blankLedger request object from vm
   * @returns {BlankLedgerVM}
   */
  public prepareBlankLedgerRequestObject(): BlankLedgerVM {
    let requestObj: BlankLedgerVM;
    requestObj = cloneDeep(this.blankLedger);
    requestObj.entryDate = moment(requestObj.entryDate).format('DD-MM-YYYY');

    // filter transactions which have selected account
    requestObj.transactions = requestObj.transactions.filter((bl: TransactionVM) => bl.particular);

    // map over transactions array
    requestObj.transactions.map((bl: any) => {
      // set transaction.particular to selectedAccount uniqueName
      bl.particular = bl.selectedAccount.uniqueName;
      bl.isInclusiveTax = false;
      // filter taxes uniqueNames
      bl.taxes = bl.taxes.filter(p => p.isChecked).map(p => p.uniqueName);
      // filter discount
      bl.discounts = bl.discounts.filter(p => p.amount && p.isActive);
      // delete local id
      delete bl['id'];
    });
    return requestObj;
  }

  /**
   * add new transaction object of given type
   * @param {string} type
   * @returns {TransactionVM}
   */
  public addNewTransaction(type: string = 'DEBIT'): TransactionVM {
    return {
      id: uuid.v4(),
      amount: 0,
      tax: 0,
      total: 0,
      particular: '',
      type,
      taxes: [],
      discount: 0,
      discounts: [
        this.staticDefaultDiscount()
      ],
      selectedAccount: null,
      applyApplicableTaxes: true,
      isInclusiveTax: true,
      isChecked: false
    };
  }

  public getUnderstandingText(selectedLedgerAccountType, accountName) {
    let data = _.cloneDeep(underStandingTextData.find(p => p.accountType === selectedLedgerAccountType));
    if (data) {
      data.balanceText.cr = data.balanceText.cr.replace('<accountName>', accountName);
      data.balanceText.dr = data.balanceText.dr.replace('<accountName>', accountName);

      data.text.dr = data.text.dr.replace('<accountName>', accountName);
      data.text.cr = data.text.cr.replace('<accountName>', accountName);
      this.ledgerUnderStandingObj = _.cloneDeep(data);
    }
  }

  /**
   * prepare bank transactions
   * @param {IELedgerResponse[]} array
   * @returns {bankTransactionsData} array
   */
  public getReadyBankTransactionsForUI(data: IELedgerResponse[]) {
    if (data.length > 0) {
      this.bankTransactionsData = [];
      this.showEledger = true;
      forEach(data, (txn: IELedgerResponse) => {
        let item: BlankLedgerVM;
        item = cloneDeep(this.blankLedger);
        item.entryDate = moment(txn.date).format('YYYY-MM-DD');
        item.transactionId = txn.transactionId;
        item.isBankTransaction = true;
        forEach(txn.transactions, (bankTxn: IELedgerTransaction) => {
          item.description = bankTxn.remarks.description;
          if (bankTxn.type === 'DEBIT') {
            item.voucherType = 'rcpt';
          } else {
            item.voucherType = 'pay';
          }
          if (bankTxn.remarks.chequeNumber) {
            item.chequeNumber = bankTxn.remarks.chequeNumber;
          }
          // push transaction
          item.transactions.map(transaction => {
            transaction.isChecked = false;
            if (transaction.type === bankTxn.type) {
              transaction.amount = bankTxn.amount;
              transaction.id = item.transactionId;
            }
          });
          item.transactions = remove(item.transactions, (n: any) => {
            return n.type === bankTxn.type;
          });
        });
        this.bankTransactionsData.push(item);
      });
    } else {
      this.bankTransactionsData = [];
      this.showEledger = false;
    }
  }

  /**
   * prepare bankLedger request object from vm for API
   * @returns {BlankLedgerVM}
   */
  public prepareBankLedgerRequestObject(): BlankLedgerVM {
    let requestObj: BlankLedgerVM;
    requestObj = cloneDeep(this.currentBankEntry);

    // filter transactions which have selected account
    requestObj.transactions = requestObj.transactions.filter((bl: TransactionVM) => bl.particular);

    // map over transactions array
    requestObj.transactions.map((bl: any) => {
      // set transaction.particular to selectedAccount uniqueName
      bl.particular = bl.selectedAccount.uniqueName;
      // filter taxes uniqueNames
      bl.taxes = bl.taxes.filter(p => p.isChecked).map(p => p.uniqueName);
      // filter discount
      bl.discounts = bl.discounts.filter(p => p.amount > 0);
      // delete local id
      delete bl['id'];
    });
    return requestObj;
  }

  public staticDefaultDiscount(): LedgerDiscountClass {
    return {
      discountType: 'FIX_AMOUNT',
      amount: 0,
      name: '',
      particular: '',
      isActive: true
    };
  }
}

export class BlankLedgerVM {
  public transactions: TransactionVM[];
  public voucherType: string;
  public entryDate: string;
  public unconfirmedEntry: boolean;
  public attachedFile: string;
  public attachedFileName?: string;
  public tag: any;
  public description: string;
  public generateInvoice: boolean;
  public chequeNumber: string;
  public chequeClearanceDate: string;
  public compoundTotal: number;
  public isBankTransaction?: boolean;
  public transactionId?: string;
  public invoiceNumberAgainstVoucher: string;
  public tagNames?: string[];
}

export class TransactionVM {
  public id?: string;
  public amount: number;
  public particular: string;
  public applyApplicableTaxes: boolean;
  public isInclusiveTax: boolean;
  public type: string;
  public taxes: string[];
  public tax?: number;
  public total: number;
  public discounts: LedgerDiscountClass[];
  public discount?: number;
  public selectedAccount?: IFlattenAccountsResultItem | any;
  public unitRate?: IInventoryUnit[];
  public isStock?: boolean = false;
  public inventory?: IInventory | any;
  public currency?: string;
  public convertedAmount?: number;
  public isChecked: boolean = false;
}

export interface IInventory {
  unit: IInventoryUnit;
  quantity: number;
  stock: INameUniqueName;
}

export interface IInventoryUnit {
  stockUnitCode: string;
  code: string;
  rate: number;
}
