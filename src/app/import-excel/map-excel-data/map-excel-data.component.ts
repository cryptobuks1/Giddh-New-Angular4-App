import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { HeaderItem, ImportExcelRequestData, ImportExcelResponseData, Mappings } from '../../models/api-models/import-excel';
import { IOption } from '../../theme/ng-select/option.interface';
import { cloneDeep } from '../../lodash-optimized';
import { ToasterService } from '../../services/toaster.service';

interface DataModel {
  field: HeaderItem;
  options: IOption[];
  selected: string;
}

class MandatoryHeaders {
  public field: string;
  public selected: boolean;
}

@Component({
  selector: 'map-excel-data',  // <home></home>
  styleUrls: ['./map-excel-data.component.scss'],
  templateUrl: './map-excel-data.component.html'
})

export class MapExcelDataComponent implements OnInit, OnDestroy, AfterViewInit {

  public get importData(): ImportExcelResponseData {
    return this._importData;
  }

  @Input()
  public set importData(value: ImportExcelResponseData) {
    this.prepareDataModel(value);
    this.prepareMandatoryHeaders(value);
    this.updateMandatoryHeadersCounters();
    this._importData = value;
    this._clonedMappings = cloneDeep(value.mappings);
  }

  @Output() public onNext = new EventEmitter<ImportExcelRequestData>();
  @Output() public onBack = new EventEmitter();
  @Input() public dataModel: DataModel[];
  public mandatoryHeadersModel: MandatoryHeaders[] = [];
  public mandatoryHeadersCount: number = 0;
  public imgPath: string;
  private importRequestData: ImportExcelRequestData;

  private _importData: ImportExcelResponseData;
  private _clonedMappings: Mappings;

  constructor(private _toaster: ToasterService) {
    //
  }

  public ngOnInit() {
    this.imgPath = isElectron ? 'assets/icon/' : AppUrl + APP_FOLDER + 'assets/icon/';
  }

  public ngAfterViewInit(): void {
    //
  }

  public ngOnDestroy() {
    //
  }

  public mapExcelData() {

    if (this.mandatoryHeadersCount !== this.mandatoryHeadersModel.length) {
      this._toaster.errorToast('Please Select Mandatory Fields..');
      return;
    }

    this.importRequestData = {
      ...this._importData,
      data: {
        items: this._importData.data.items
          .map(p => ({...p, row: p.row.map((value, index) => ({...value, columnNumber: index.toString()}))}))
        , numRows: 0, totalRows: 0
      }
    };
    this.onNext.emit(this.importRequestData);
  }

  public columnSelected(val: IOption, data: DataModel) {
    if (!val.value) {
      return;
    }

    this.dataModel = this.dataModel.map(m => {
      if (data.field.columnNumber !== m.field.columnNumber) {
        m.options = m.options.filter(f => f.value !== val.value);
      }
      return m;
    });

    let indexFromMappings = this._importData.mappings.findIndex(f => f.column === parseInt(data.field.columnNumber));

    if (indexFromMappings > -1) {
      this._importData.mappings[indexFromMappings].columnHeader = val.value;
    } else {
      this._importData.mappings[indexFromMappings].columnHeader = null;
    }

    this.mandatoryHeadersModel = this.mandatoryHeadersModel.map(m => {
      if (this.toLowerCase(val.value) === this.toLowerCase(m.field)) {
        m.selected = true;
      }
      return m;
    });
    this.updateMandatoryHeadersCounters();
  }

  public clearSelected(val: IOption, data: DataModel) {

    this.mandatoryHeadersModel = this.mandatoryHeadersModel.map(m => {
      if (m.field === val.value) {
        m.selected = false;
      }
      return m;
    });

    this.dataModel = this.dataModel.map(m => {
      if (data.field.columnNumber !== m.field.columnNumber) {
        m.options.push(val);
      }
      return m;
    });
    this.updateMandatoryHeadersCounters();
  }

  public updateMandatoryHeadersCounters() {
    this.mandatoryHeadersCount = this.mandatoryHeadersModel.filter(f => f.selected).length;
  }

  private prepareDataModel(value: ImportExcelResponseData) {
    let options: IOption[] = value.giddhHeaders.map(p => {
      return {label: p, value: p};
    });
    this.dataModel = value.headers.items.map((field: HeaderItem) => {
      let selectedIndex;
      let allSuggestedColumnHeader = value.mappings.map(m => m.suggestedColumnHeader);

      // options = options.filter(f => allSuggestedColumnHeader.indexOf(f.value) === -1);
      selectedIndex = value.mappings.findIndex(f => f.column === parseInt(field.columnNumber));
      return {
        field,
        options,
        selected: selectedIndex > -1 ? value.mappings[selectedIndex].suggestedColumnHeader : '',
      };
    });
  }

  private prepareMandatoryHeaders(value: ImportExcelResponseData) {
    this.mandatoryHeadersModel = [];
    value.mandatoryHeaders.forEach(f => {
      this.mandatoryHeadersModel.push({field: this.toLowerCase(f), selected: value.mappings.some(d => this.toLowerCase(d.suggestedColumnHeader) === this.toLowerCase(f))});
    });
  }

  private toLowerCase(str: string = '') {
    return str.toLowerCase();
  }
}
