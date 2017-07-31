import { BaseResponse } from '../../models/api-models/BaseResponse';
import { DownloadLedgerRequest, TransactionsRequest, TransactionsResponse } from '../../models/api-models/Ledger';
import { AccountResponse } from '../../models/api-models/Account';
import { Action } from '@ngrx/store';
import { LEDGER } from '../../services/actions/ledger/ledger.const';
import { FlattenGroupsAccountsResponse } from '../../models/api-models/Group';
import { IFlattenGroupsAccountsDetail } from '../../models/interfaces/flattenGroupsAccountsDetail.interface';

export interface LedgerState {
  account?: AccountResponse;
  transcationRequest?: TransactionsRequest;
  transactionsResponse?: TransactionsResponse;
  transactionInprogress: boolean;
  accountInprogress: boolean;
  downloadInvoiceInProcess?: boolean;
  discountAccountsList?: IFlattenGroupsAccountsDetail;
}

export const initialState: LedgerState = {
  transactionInprogress: false,
  accountInprogress: false
};

export function ledgerReducer(state = initialState, action: Action): LedgerState {
  let data: BaseResponse<AccountResponse, string>;
  let transaction: BaseResponse<TransactionsResponse, TransactionsRequest>;
  switch (action.type) {
    case LEDGER.GET_LEDGER_ACCOUNT:
      return Object.assign({}, state, {
        accountInprogress: true
      });
    case LEDGER.GET_LEDGER_ACCOUNT_RESPONSE:
      data = action.payload as BaseResponse<AccountResponse, string>;
      if (data.status === 'success') {
        return Object.assign({}, state, {
          accountInprogress: false,
          account: data.body
        });
      }
      return Object.assign({}, state, {
        accountInprogress: false
      });
    case LEDGER.GET_TRANSACTION:
      return Object.assign({}, state, {
        transactionInprogress: true
      });
    case LEDGER.GET_TRANSACTION_RESPONSE:
      transaction = action.payload as BaseResponse<TransactionsResponse, TransactionsRequest>;
      if (transaction.status === 'success') {
        return Object.assign({}, state, {
          transactionInprogress: false,
          transcationRequest: transaction.request,
          transactionsResponse: transaction.body
        });
      }
      return Object.assign({}, state, {
        transactionInprogress: false
      });
    case LEDGER.DOWNLOAD_LEDGER_INVOICE:
      return Object.assign({}, state, {downloadInvoiceInProcess: true});
    case LEDGER.DOWNLOAD_LEDGER_INVOICE_RESPONSE:
      let downloadData = action.payload as BaseResponse<string, DownloadLedgerRequest>;
      if (downloadData.status === 'success') {
        return Object.assign({}, state, {downloadInvoiceInProcess: false});
      }
      return Object.assign({}, state, {downloadInvoiceInProcess: false});
    case LEDGER.GET_DISCOUNT_ACCOUNTS_LIST_RESPONSE:
      let discountData: BaseResponse<FlattenGroupsAccountsResponse, string> = action.payload;
      if (discountData.status === 'success') {
        return Object.assign({}, state, {
          discountAccountsList: discountData.body.results.find(r => r.groupUniqueName === 'discount')
        });
      }
      return state;
    default: {
      return state;
    }
  }
}
