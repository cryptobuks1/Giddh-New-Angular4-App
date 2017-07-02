import { GroupsWithStocksHierarchyMin } from '../../../models/api-models/GroupsWithStocks';
import { BaseResponse } from '../../../models/api-models/BaseResponse';
import { StockGroupResponse } from '../../../models/api-models/Inventory';
import { InventoryActionsConst } from './inventory.const';
import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { ToasterService } from '../../toaster.service';
import { Store, Action } from '@ngrx/store';
import { AppState } from '../../../store/roots';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Rx';
import { InventoryService } from '../../inventory.service';

@Injectable()
export class SidebarAction {
  @Effect()
  public GetInventoryGroup$: Observable<Action> = this.action$
    .ofType(InventoryActionsConst.GetInventoryGroup)
    .switchMap(action => this._inventoryService.GetGroupsStock(action.payload.groupUniqueName))
    .map(response => {
      return this.GetInventoryGroupResponse(response);
    });

  @Effect()
  public GetInventoryGroupResponse$: Observable<Action> = this.action$
    .ofType(InventoryActionsConst.GetInventoryGroupResponse)
    .map(action => {
      let data: BaseResponse<StockGroupResponse, string> = action.payload;
      if (action.payload.status === 'error') {
        this._toasty.errorToast(action.payload.message, action.payload.code);
      }
      return { type: '' };
    });

  @Effect()
  public GetGroupUniqueName$: Observable<Action> = this.action$
    .ofType(InventoryActionsConst.GetGroupUniqueName)
    .switchMap(action => this._inventoryService.GetGroupsStock(action.payload))
    .map(response => {
      return this.GetGroupUniqueNameResponse(response);
    });

  @Effect()
  public GetGroupUniqueNameResponse$: Observable<Action> = this.action$
    .ofType(InventoryActionsConst.GetGroupUniqueNameResponse)
    .map(action => {
      let data: BaseResponse<StockGroupResponse, string> = action.payload;
      return { type: '' };
    });

  @Effect()
  public GetGroupsWithStocksHierarchyMin$: Observable<Action> = this.action$
    .ofType(InventoryActionsConst.GetGroupsWithStocksHierarchyMin)
    .switchMap(action => this._inventoryService.GetGroupsWithStocksHierarchyMin(action.payload))
    .map(response => {
      return this.GetGroupsWithStocksHierarchyMinResponse(response);
    });

  @Effect()
  public GetGroupsWithStocksHierarchyMinResponse$: Observable<Action> = this.action$
    .ofType(InventoryActionsConst.GetGroupsWithStocksHierarchyMinResponse)
    .map(action => {
      let data: BaseResponse<StockGroupResponse, string> = action.payload;
      if (action.payload.status === 'error') {
        this._toasty.errorToast(action.payload.message, action.payload.code);
      }
      return { type: '' };
    });
  constructor(
    private action$: Actions,
    private _toasty: ToasterService,
    private store: Store<AppState>,
    private _inventoryService: InventoryService,
  ) {
  }
  public OpenGroup(groupUniqueName: string): Action {
    return {
      type: InventoryActionsConst.InventoryGroupToggleOpen,
      payload: groupUniqueName
    };
  }
  public GetInventoryGroup(groupUniqueName: string, stockUniqueName?: string): Action {
    return {
      type: InventoryActionsConst.GetInventoryGroup,
      payload: {groupUniqueName, stockUniqueName}
    };
  }

  public GetInventoryGroupResponse(value: BaseResponse<StockGroupResponse, string>): Action {
    return {
      type: InventoryActionsConst.GetInventoryGroupResponse,
      payload: value
    };
  }

  public GetGroupUniqueName(groupUniqueName: string): Action {
    return {
      type: InventoryActionsConst.GetGroupUniqueName,
      payload: groupUniqueName
    };
  }

  public GetGroupUniqueNameResponse(value: BaseResponse<StockGroupResponse, string>): Action {
    return {
      type: InventoryActionsConst.GetGroupUniqueNameResponse,
      payload: value
    };
  }

  public GetInventoryStock(stockUniqueName: string): Action {
    return {
      type: InventoryActionsConst.GetInventoryStock,
      payload: stockUniqueName
    };
  }

  public GetInventoryStockResponse(value: BaseResponse<StockGroupResponse, string>): Action {
    return {
      type: InventoryActionsConst.GetInventoryStockResponse,
      payload: value
    };
  }

  public GetGroupsWithStocksHierarchyMin(): Action {
    return {
      type: InventoryActionsConst.GetGroupsWithStocksHierarchyMin
    };
  }

  public GetGroupsWithStocksHierarchyMinResponse(value: BaseResponse<GroupsWithStocksHierarchyMin, string>): Action {
    return {
      type: InventoryActionsConst.GetGroupsWithStocksHierarchyMinResponse,
      payload: value
    };
  }
}
