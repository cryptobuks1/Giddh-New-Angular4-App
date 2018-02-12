import { ReplaySubject } from 'rxjs';
import { AccountService } from 'app/services/account.service';
import { TallyModuleService } from './tally-service';
import { KeyboardService } from 'app/accounting/keyboard.service';
import { Router } from '@angular/router';
import { Component, OnInit, HostListener } from '@angular/core';
import { CompanyActions } from '../actions/company.actions';
import { AppState } from '../store/roots';
import { Store } from '@ngrx/store';
import { StateDetailsRequest } from '../models/api-models/Company';

export const PAGE_SHORTCUT_MAPPING = [
  {
    keyCode: 'F7',
    inputForFn: {
      page: 'Journal',
      uniqueName: 'purchases',
      gridType: 'voucher'
    }
  },
  {
    keyCode: 'F9',
    inputForFn: {
      page: 'Purchase',
      uniqueName: 'purchases',
      gridType: 'voucher'
    }
  },
  {
    keyCode: 'F8',
    inputForFn: {
      page: 'Sales',
      uniqueName: 'purchases',
      gridType: 'voucher'
    }
  },
  {
    keyCode: 'F9',
    altKey: true,
    inputForFn: {
      page: 'Debit note',
      uniqueName: 'purchases',
      gridType: 'voucher'
    }
  },
  {
    keyCode: 'F8',
    altKey: true,
    inputForFn: {
      page: 'Credit note',
      uniqueName: 'purchases',
      gridType: 'voucher'
    }
  },
  {
    keyCode: 'F5',
    inputForFn: {
      page: 'Payment',
      uniqueName: 'purchases',
      gridType: 'voucher'
    }
  },
  {
    keyCode: 'F6',
    inputForFn: {
      page: 'Receipt',
      uniqueName: 'null',
      gridType: 'voucher'
    }
  },
  {
    keyCode: 'F4',
    inputForFn: {
      page: 'Contra',
      uniqueName: 'purchases',
      gridType: 'voucher'
    }
  }
];

export const PAGES_WITH_CHILD = ['Purchase', 'Sales', 'Credit note', 'Debit note'];

@Component({
  templateUrl: './accounting.component.html',
  styleUrls: ['./accounting.component.css']
})

export class AccountingComponent implements OnInit {

  public gridType: string = 'voucher';
  public selectedPage: string = 'journal';
  public flattenAccounts: any = [];

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(private store: Store<AppState>,
    private companyActions: CompanyActions,
    private _router: Router,
    private _keyboardService: KeyboardService,
    private _tallyModuleService: TallyModuleService,
    private _accountService: AccountService) {
      this._tallyModuleService.selectedPageInfo.subscribe((d) => {
        if (d) {
          this.gridType = d.gridType;
          this.selectedPage = d.page;
        }
      });
  }

  @HostListener('document:keyup', ['$event'])
  public handleKeyboardEvent(event: KeyboardEvent) {
    // Handling Alt + v
    if (event.altKey && event.code === 'KeyV') {
      const selectedPage = this._tallyModuleService.selectedPageInfo.value;
      if (PAGES_WITH_CHILD.indexOf(selectedPage.page) > -1) {
        if (selectedPage.gridType === 'voucher') {
          this._tallyModuleService.setVoucher({
            page: selectedPage.page,
            uniqueName: selectedPage.uniqueName,
            gridType: 'invoice'
          });
        } else {
          this._tallyModuleService.setVoucher({
            page: selectedPage.page,
            uniqueName: selectedPage.uniqueName,
            gridType: 'voucher'
          });
        }
      } else {
        return;
      }
    } else {
      let selectedPageIndx = PAGE_SHORTCUT_MAPPING.findIndex((page: any) => {
        if (event.altKey) {
          return page.keyCode === event.code && page.altKey;
        } else {
          return page.keyCode === event.code;
        }
      });
      if (selectedPageIndx > -1) {
        // this._router.navigate([]);
        this._tallyModuleService.setVoucher(PAGE_SHORTCUT_MAPPING[selectedPageIndx].inputForFn);
        // this._keyboardService.setKey(event);
      }
    }
  }
  public ngOnInit(): void {
    let companyUniqueName = null;
    this.store.select(c => c.session.companyUniqueName).take(1).subscribe(s => companyUniqueName = s);
    let stateDetailsRequest = new StateDetailsRequest();
    stateDetailsRequest.companyUniqueName = companyUniqueName;
    stateDetailsRequest.lastState = 'accounting';

    this.store.dispatch(this.companyActions.SetStateDetails(stateDetailsRequest));

    this.store.select(p => p.session.companyUniqueName).take(1).subscribe(a => {
      if (a && a !== '') {
        this._accountService.GetFlattenAccounts('', '', '').takeUntil(this.destroyed$).subscribe(data => {
        if (data.status === 'success') {
          this.flattenAccounts = data.body.results;
          this._tallyModuleService.setFlattenAccounts(data.body.results);
        }
      });
      }
    });
  }

  /**
   * setAccount to send accountObj to service
   */
  public setAccount(accountObj) {
    //
  }

  /**
   * setStock to send stockObj to service
   */
  public setStock(stockObj) {
    //
  }

}
