import { TransactionsResponse, IELedgerResponse, IELedgerTransaction } from '../models/api-models/Ledger';
import { Observable } from 'rxjs/Observable';
import { AccountResponse } from '../models/api-models/Account';
import { ILedgerDiscount, ITransactionItem } from '../models/interfaces/ledger.interface';
import * as moment from 'moment/moment';
import { IFlattenAccountsResultItem } from '../models/interfaces/flattenAccountsResultItem.interface';
import { IFlattenGroupsAccountsDetail } from '../models/interfaces/flattenGroupsAccountsDetail.interface';
import * as uuid from 'uuid';
import { cloneDeep, groupBy, forEach, remove } from '../lodash-optimized';
import { GroupsWithAccountsResponse } from '../models/api-models/GroupsWithAccounts';
import { INameUniqueName } from '../models/interfaces/nameUniqueName.interface';
import { IOption } from '../theme/ng-select/option.interface';
import { underStandingTextData } from './underStandingTextData';

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
  public discountAccountsList: IFlattenGroupsAccountsDetail[] = [];
  public showNewLedgerPanel: boolean = false;
  public noAccountChosenForNewEntry: boolean;
  public selectedAccount: IFlattenAccountsResultItem = null;
  public today: Date = new Date();
  public fromDate: Date;
  public toDate: Date;
  public format: string = 'dd-MM-yyyy';
  public accountUnq: string = '';
  public blankLedger: BlankLedgerVM;
  public dateMask = [/\d/, /\d/, '-', /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];
  // public datePipe = createAutoCorrectedDatePipe('dd-mm-yyyy');
  public isAmountFirst: boolean = false;
  public isTotalFirts: boolean = false;
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
          discounts: [],
          selectedAccount: null,
          applyApplicableTaxes: true,
          isInclusiveTax: true
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
          discounts: [],
          selectedAccount: null,
          applyApplicableTaxes: true,
          isInclusiveTax: true
        }],
      voucherType: 'sal',
      entryDate: moment().format('DD-MM-YYYY'),
      unconfirmedEntry: false,
      attachedFile: '',
      attachedFileName: '',
      tag: null,
      description: '',
      generateInvoice: false,
      chequeNumber: '',
      chequeClearanceDate: ''
    };
  }

  /**
   * prepare blankLedger request object from vm
   * @returns {BlankLedgerVM}
   */
  public prepareBlankLedgerRequestObject(): BlankLedgerVM {
    let requestObj: BlankLedgerVM;
    requestObj = cloneDeep(this.blankLedger);

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
      discounts: [],
      selectedAccount: null,
      applyApplicableTaxes: true,
      isInclusiveTax: true
    };
  }

  public getUnderstandingText(selectedLedgerAccountType, accountName) {
    let data = underStandingTextData.find(p => p.accountType === selectedLedgerAccountType);
    if (data) {
      data.balanceText.cr = data.balanceText.cr.replace('<accountName>', accountName);
      data.balanceText.dr = data.balanceText.dr.replace('<accountName>', accountName);

      data.text.dr = data.text.dr.replace('<accountName>', accountName);
      data.text.cr = data.text.cr.replace('<accountName>', accountName);
      this.ledgerUnderStandingObj = data;
    }
  }

  /**
   * prepare bank transactions
   * @param {IELedgerResponse[]} array
   * @returns {bankTransactionsData} array
   */
  public getReadyBankTransactionsForUI(data: IELedgerResponse[]) {
    this.bankTransactionsData = [];
    this.showEledger = true;
    forEach(data, (txn: IELedgerResponse) => {
      let item: BlankLedgerVM;
      item = cloneDeep(this.blankLedger);
      item.entryDate = txn.date;
      item.transactionId = txn.transactionId;
      item.isBankTransaction = true;
      forEach(txn.transactions, (bankTxn: IELedgerTransaction) => {
        item.description = bankTxn.remarks.description;
        if (bankTxn.type === 'DEBIT') {
          item.voucherType = 'rcpt';
        }else {
          item.voucherType = 'pay';
        }
        if (bankTxn.remarks.chequeNumber) {
          item.chequeNumber = bankTxn.remarks.chequeNumber;
        }
        // push transaction
        item.transactions.map(transaction => {
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

  /** ledger custom filter **/
  public ledgerCustomFilter(term: string, item: IOption): boolean {
    return (item.label.toLocaleLowerCase().indexOf(term) > -1 || item.additional.uniqueName.toLocaleLowerCase().indexOf(term) > -1);
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
  public isBankTransaction?: boolean;
  public transactionId?: string;
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
  public discounts: ILedgerDiscount[];
  public discount?: number;
  public selectedAccount?: IFlattenAccountsResultItem | any;
  public unitRate?: IInventoryUnit[];
  public isStock?: boolean = false;
  public inventory?: IInventory;
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
