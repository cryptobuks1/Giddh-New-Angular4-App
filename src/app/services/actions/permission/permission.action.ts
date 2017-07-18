/**
 * Created by ad on 04-07-2017.
 */

import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { ToasterService } from '../../toaster.service';
import { Action, Store } from '@ngrx/store';
import { AppState } from '../../../store/roots';
import { Observable } from 'rxjs/Rx';
import { BaseResponse } from '../../../models/api-models/BaseResponse';
import { PermissionService } from "../../permission.service";
import { PERMISSION_ACTIONS } from './permission.const';
import { NewRole, CreateNewRoleRequest, PermissionResponse } from '../../../models/api-models/Permission';

@Injectable()
export class PermissionActions {

  @Effect()
  private GetRoles$: Observable<Action> = this.action$
    .ofType(PERMISSION_ACTIONS.GET_ROLES)
    .switchMap(action => {
      return this._permissionService.GetAllRoles()
        .map((r) => {
          return this.validateResponse<PermissionResponse[], string>(r, {
            type: PERMISSION_ACTIONS.GET_ROLES_RESPONSE,
            payload: r
          }, true, {
              type: PERMISSION_ACTIONS.GET_ROLES_RESPONSE,
              payload: r
            });
        });
    });

  @Effect()
  private CreateStockUnit$: Observable<Action> = this.action$
    .ofType(PERMISSION_ACTIONS.CREATE_NEW_ROLE)
    .switchMap(action => {
      return this._permissionService.CreateNewRole(action.payload)
        .map((r) => this.validateResponse(r, {
          type: PERMISSION_ACTIONS.CREATE_NEW_ROLE_RESPONSE,
          payload: action.payload
        }, true));
    });


  constructor(private action$: Actions,
    private _toasty: ToasterService,
    private store: Store<AppState>,
    private _permissionService: PermissionService) {
  }

  public GetRoles() {
    return { type: PERMISSION_ACTIONS.GET_ROLES }
  }

  public GetRolesResponse(value: BaseResponse<PermissionResponse[], string>) {
    return {
      type: PERMISSION_ACTIONS.GET_ROLES_RESPONSE,
      payload: value
    }
  }

  public CreateNewRole(value): Action {
    return {
      type: PERMISSION_ACTIONS.CREATE_NEW_ROLE,
      payload: value
    }
  }

  public SaveNewRole(unit: CreateNewRoleRequest): Action {
    return {
      type: CUSTOM_STOCK_UNIT_ACTIONS.CREATE_STOCK_UNIT,
      payload: unit
    };
  }

  private validateResponse<TResponse, TRequest>(response: BaseResponse<TResponse, TRequest>, successAction: Action, showToast: boolean = false, errorAction: Action = { type: '' }): Action {
    if (response.status === 'error') {
      if (showToast) {
        this._toasty.errorToast(response.message);
      }
      return errorAction;
    }
    return successAction;
  }
}
