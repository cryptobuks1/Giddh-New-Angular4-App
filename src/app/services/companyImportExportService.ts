import { Inject, Injectable, Optional } from '@angular/core';
import 'rxjs/add/operator/map';
import { HttpWrapperService } from './httpWrapper.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { BaseResponse } from '../models/api-models/BaseResponse';
import { UserDetails } from '../models/api-models/loginModels';
import { ErrorHandler } from './catchManager/catchmanger';
import { LOGS_API } from './apiurls/logs.api';
import { LogsRequest, LogsResponse } from '../models/api-models/Logs';
import { GeneralService } from './general.service';
import { IServiceConfigArgs, ServiceConfig } from './service.config';
import { COMPANY_IMPORT_EXPORT_API } from './apiurls/company-import-export.api';
import { HttpHeaders } from '@angular/common/http';

@Injectable()
export class CompanyImportExportService {
  private companyUniqueName: string;
  private user: UserDetails;

  constructor(private errorHandler: ErrorHandler, public _http: HttpWrapperService, public _router: Router,
              private _generalService: GeneralService, @Optional() @Inject(ServiceConfig) private config: IServiceConfigArgs) {
  }

  public ExportRequest(): Observable<BaseResponse<any, string>> {
    this.user = this._generalService.user;
    this.companyUniqueName = this._generalService.companyUniqueName;

    return this._http.get(this.config.apiUrl + COMPANY_IMPORT_EXPORT_API.EXPORT.replace(':companyUniqueName', encodeURIComponent(this.companyUniqueName)))
      .map((res) => {
        let data: BaseResponse<any, string> = res;
        return data;
      })
      .catch((e) => this.errorHandler.HandleCatch<any, string>(e, ''));
  }

  public ExportLedgersRequest(from: string, to: string): Observable<BaseResponse<any, string>> {
    this.user = this._generalService.user;
    this.companyUniqueName = this._generalService.companyUniqueName;

    return this._http.get(this.config.apiUrl + COMPANY_IMPORT_EXPORT_API.EXPORT_LEDGERS
      .replace(':companyUniqueName', encodeURIComponent(this.companyUniqueName))
      .replace(':from', encodeURIComponent(from))
      .replace(':to', encodeURIComponent(to))
    )
      .map((res) => {
        let data: BaseResponse<any, string> = res;
        return data;
      })
      .catch((e) => this.errorHandler.HandleCatch<any, string>(e, ''));
  }

  public ImportRequest(file: File): Observable<BaseResponse<string, string>> {
    this.user = this._generalService.user;
    this.companyUniqueName = this._generalService.companyUniqueName;

    const formData: FormData = new FormData();
    formData.append('importFile', file, file.name);

    const httpOptions = {
      headers: {'Content-Type': 'multipart/*'}
    };

    // const header = new Header
    return this._http.post(this.config.apiUrl + COMPANY_IMPORT_EXPORT_API.IMPORT
      .replace(':companyUniqueName', encodeURIComponent(this.companyUniqueName)), formData, httpOptions)
      .map((res) => {
        let data: BaseResponse<string, string> = res;
        return data;
      })
      .catch((e) => this.errorHandler.HandleCatch<string, string>(e, ''));
  }

  public ImportLedgersRequest(file: File): Observable<BaseResponse<string, string>> {
    this.user = this._generalService.user;
    this.companyUniqueName = this._generalService.companyUniqueName;

    const formData: FormData = new FormData();
    formData.append('importFile', file, file.name);

    const httpOptions = {
      headers: {'Content-Type': 'multipart/form-data', 'Accept': 'application/json'}
    };

    return this._http.post(this.config.apiUrl + COMPANY_IMPORT_EXPORT_API.IMPORT_LEDGERS
      .replace(':companyUniqueName', encodeURIComponent(this.companyUniqueName)), formData, httpOptions)
      .map((res) => {
        let data: BaseResponse<string, string> = res;
        return data;
      })
      .catch((e) => this.errorHandler.HandleCatch<string, string>(e, ''));
  }
}
