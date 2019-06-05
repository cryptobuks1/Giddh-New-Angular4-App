import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { ToasterService } from '../../services/toaster.service';
import { Action, Store } from '@ngrx/store';
import { AppState } from '../../store';
import { ProformaService } from '../../services/proforma.service';
import { CustomActions } from '../../store/customActions';
import { PROFORMA_ACTIONS } from './proforma.const';
import { GenericRequestForGenerateSCD } from '../../models/api-models/Sales';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { BaseResponse } from '../../models/api-models/BaseResponse';

@Injectable()
export class ProformaActions {

  @Effect()
  private GENERATE_PROFORMA$: Observable<Action> =
    this.action$.pipe(
      ofType(PROFORMA_ACTIONS.GENERATE_PROFORMA_REQUEST),
      switchMap((action: CustomActions) => this.proformaService.generate(action.payload)),
      map((response) => {
        if (response.status === 'success') {
          let no: string;
          switch (response.body.voucher.voucherDetails.voucherType) {
            case 'proforma':
              no = response.body.voucher.voucherDetails.proformaNumber;
              break;
            case 'estimate' :
              no = response.body.voucher.voucherDetails.estimateNumber;
              break;
            default:
              no = response.body.voucher.voucherDetails.voucherNumber;
          }
          this._toasty.successToast(`Entry created successfully with Voucher No: ${no}`);
        } else {
          this._toasty.errorToast(response.message, response.code);
        }
        return this.generateProformaResponse(response);
      })
    );

  constructor(private action$: Actions, private _toasty: ToasterService, private store: Store<AppState>,
              private proformaService: ProformaService) {

  }

  public generateProforma(request: GenericRequestForGenerateSCD): CustomActions {
    return {
      type: PROFORMA_ACTIONS.GENERATE_PROFORMA_REQUEST,
      payload: request
    }
  }

  public generateProformaResponse(response: BaseResponse<GenericRequestForGenerateSCD, GenericRequestForGenerateSCD>): CustomActions {
    return {
      type: PROFORMA_ACTIONS.GENERATE_PROFORMA_RESPONSE,
      payload: response
    }
  }

  private validateResponse<TResponse, TRequest>(response: BaseResponse<TResponse, TRequest>, successAction: CustomActions, showToast: boolean = false,
                                                errorAction: CustomActions = {type: 'EmptyAction'}, message?: string): CustomActions {
    if (response.status === 'error') {
      if (showToast) {
        this._toasty.errorToast(response.message);
      }
      return errorAction;
    } else {
      if (showToast && typeof response.body === 'string') {
        this._toasty.successToast(response.body);
      } else if (message) {
        this._toasty.successToast(message);
      }
    }
    return successAction;
  }
}
