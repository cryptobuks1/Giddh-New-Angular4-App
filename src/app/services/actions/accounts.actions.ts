import {
  AccountService
} from './../account.service';
import {
  AppState
} from './../../store/roots';
import {
  ToasterService
} from './../toaster.service';
import {
  AccountResponse, AccountRequest
} from './../../models/api-models/Account';
import {
  BaseResponse
} from './../../models/api-models/BaseResponse';
import {
  Action,
  Store
} from '@ngrx/store';
import {
  Observable
} from 'rxjs';
import {
  Effect,
  Actions
} from '@ngrx/effects';
import {
  Injectable
} from '@angular/core';

import { GroupWithAccountsAction } from './groupwithaccounts.actions';

@Injectable()
export class AccountsAction {
  public static CREATE_ACCOUNT = 'CreateAccount';
  public static CREATE_ACCOUNT_RESPONSE = 'CreateAccountResponse';
  public static UPDATE_ACCOUNT = 'UpdateAccount';
  public static UPDATE_ACCOUNT_RESPONSE = 'UpdateAccountResponse';
  public static GET_ACCOUNT_DETAILS = 'AccountDetails';
  public static GET_ACCOUNT_DETAILS_RESPONSE = 'AccountDetailsResponse';
  public static RESET_ACTIVE_ACCOUNT = 'AccountReset';

  @Effect()
  public CreateAccount$: Observable < Action > = this.action$
    .ofType(AccountsAction.CREATE_ACCOUNT)
    .debug('')
    .switchMap(action => this._accountService.CreateAccount(action.payload.accountUniqueName, action.payload.account))
    .map(response => {
      return this.createAccountResponse(response);
    });

  @Effect()
  public CreateAccountResponse$: Observable < Action > = this.action$
    .ofType(AccountsAction.CREATE_ACCOUNT_RESPONSE)
    .debug('')
    .map(action => {
      if (action.payload.status === 'error') {
        this._toasty.errorToast(action.payload.message, action.payload.code);
        return {
          type: ''
        };
      } else {
        this._toasty.successToast('Account Created Successfully');
      }
      this.store.dispatch(this.groupWithAccountsAction.hideAddAccountForm());
      this.store.dispatch(this.groupWithAccountsAction.getGroupWithAccounts(''));
      return {type: ''};
    });
  @Effect()
  public GetAccountDetails$: Observable < Action > = this.action$
    .ofType(AccountsAction.GET_ACCOUNT_DETAILS)
    .debug('')
    .switchMap(action => this._accountService.GetAccountDetails(action.payload))
    .map(response => {
      return this.getAccountDetailsResponse(response);
    });
  @Effect()
  public GetAccountDetailsResponse$: Observable < Action > = this.action$
    .ofType(AccountsAction.GET_ACCOUNT_DETAILS_RESPONSE)
    .debug('')
    .map(action => {
      if (action.payload.status === 'error') {
        this._toasty.errorToast(action.payload.message, action.payload.code);
      }
      return {
        type: ''
      };
    });

  @Effect()
  public UpdateAccount$: Observable < Action > = this.action$
    .ofType(AccountsAction.UPDATE_ACCOUNT)
    .debug('')
    .switchMap(action => this._accountService.UpdateAccount(action.payload.account, action.payload.accountUniqueName))
    .map(response => {
      return this.updateAccountResponse(response);
    });

  @Effect()
  public UpdateAccountResponse$: Observable < Action > = this.action$
    .ofType(AccountsAction.UPDATE_ACCOUNT_RESPONSE)
    .debug('')
    .map(action => {
      if (action.payload.status === 'error') {
        this._toasty.errorToast(action.payload.message, action.payload.code);
      } else {
        this._toasty.successToast('Account Updated Successfully');
        this.store.dispatch(this.groupWithAccountsAction.getGroupWithAccounts(''));
      }
      return {type: ''};
    });
  constructor(
    private action$: Actions,
    private _accountService: AccountService,
    private _toasty: ToasterService,
    private store: Store < AppState >,
    private groupWithAccountsAction: GroupWithAccountsAction
  ) {

  }

  public createAccount(value: string, account: AccountRequest): Action {
    return {
      type: AccountsAction.CREATE_ACCOUNT,
      payload: Object.assign({}, {
        accountUniqueName: value
      }, {
        account
      })
    };
  }
  public createAccountResponse(value: BaseResponse < AccountResponse > ): Action {
    return {
      type: AccountsAction.CREATE_ACCOUNT_RESPONSE,
      payload: value
    };
  }
  public updateAccount(value: string, account: AccountRequest): Action {
    return {
      type: AccountsAction.UPDATE_ACCOUNT,
      payload: Object.assign({}, {
        accountUniqueName: value
      }, {
        account
      })
    };
  }
  public updateAccountResponse(value: BaseResponse < AccountResponse > ): Action {
    return {
      type: AccountsAction.UPDATE_ACCOUNT_RESPONSE,
      payload: value
    };
  }
  public getAccountDetails(value: string): Action {
    return {
      type: AccountsAction.GET_ACCOUNT_DETAILS,
      payload: value
    };
  }
  public getAccountDetailsResponse(value: BaseResponse < AccountResponse > ): Action {
    return {
      type: AccountsAction.GET_ACCOUNT_DETAILS_RESPONSE,
      payload: value
    };
  }
  public resetActiveAccount(): Action {
    return {
      type: AccountsAction.RESET_ACTIVE_ACCOUNT
    };
  }
}
