import { INameUniqueName } from './nameUniqueName.interface';
import { IPagination } from './paginatedResponse.interface';

/**
 * interface used in transaction item everywhere
 */
export interface ILedgerTransactionItem {
  amount: number;
  date?: string;
  isStock?: boolean;
  inventory?: IInventory;
  isTax?: boolean;
  isBaseAccount?: boolean;
  particular: INameUniqueName;
  type: string;
}

export interface IInventory {
  amount: number;
  quantity: number;
  rate: number;
  stock?: INameUniqueName;
  unit: IUnit;
}

export interface IUnit {
  name?: string;
  code?: string;
  hierarchicalQuantity?: number;
  parentStockUnit?: any;
  quantityPerUnit?: number;
}

export interface IInvoiceRequest {
  invoice: IInvoice;
}

export interface IInvoiceTransactionItem {
  accountUniqueName: string;
  description?: string;
}

export interface IInvoiceEntryItem {
  transactions: IInvoiceTransactionItem[];
}

export interface IInvoice {
  entries: IInvoiceEntryItem[];
}

export interface ILedger {
  applyApplicableTaxes?: boolean;
  attachedFile?: string;
  attachedFileName?: string;
  compoundTotal?: number;
  chequeNumber?: string;
  chequeClearanceDate?: string;
  description?: string;
  entryDate: string;
  generateInvoice?: boolean;
  isInclusiveTax?: boolean;
  tag?: string;
  taxes?: string[];
  transactions: ILedgerTransactionItem[];
  unconfirmedEntry?: boolean;
  voucher: IVoucherItem;
  voucherType: string;
}

export interface ITransactions extends IPagination {
  closingBalance: IClosingBalance;
  creditTotal: number;
  creditTransactions: ITransactionItem[];
  creditTransactionsCount: number;
  debitTotal: number;
  debitTransactions: ITransactionItem[];
  debitTransactionsCount: number;
  forwardedBalance: IForwardBalance;
}

export interface IClosingBalance {
  amount: number;
  type: string;
}

export interface IForwardBalance extends IClosingBalance {
  description?: string;
}

export interface ITransactionItem {
  amount: number;
  attachedFileName: string;
  attachedFileUniqueName: string;
  chequeClearanceDate: string;
  chequeNumber: string;
  description: string;
  entryCreatedAt: string;
  entryDate: string;
  entryUniqueName: string;
  inventory?: IInventory;
  invoiceNumber: string;
  isBaseAccount: boolean;
  isCompoundEntry: boolean;
  isInvoiceGenerated: boolean;
  isTax: boolean;
  particular: INameUniqueName;
  type: string;
  unconfirmedEntry: boolean;
}

/**
 * interface used in create ledger request and response
 */
export interface IVoucherItem {
  name: string;
  shortCode: string;
}

/**
 * interface used in create ledger entry request and response
 */
export interface ITotalItem {
  amount: number;
  type: string;
}

export interface ILedgerDiscount {
  name: string;
  particular: string;
  amount: number;
  type?: string;
}
