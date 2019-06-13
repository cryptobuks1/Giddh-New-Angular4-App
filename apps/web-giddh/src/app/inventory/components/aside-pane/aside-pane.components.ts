import { takeUntil } from 'rxjs/operators';
import { Component, EventEmitter, OnChanges, OnDestroy, OnInit, Output, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../../store';
import { Observable, ReplaySubject } from 'rxjs';
import { InventoryAction } from '../../../actions/inventory/inventory.actions';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Router } from '@angular/router';

@Component({
  selector: 'aside-pane',
  animations: [
    trigger('slideInOut', [
      state('in', style({
        transform: 'translate3d(0, 0, 0)'
      })),
      state('out', style({
        transform: 'translate3d(100%, 0, 0)'
      })),
      transition('in => out', animate('400ms ease-in-out')),
      transition('out => in', animate('400ms ease-in-out'))
    ]),
  ],
  styleUrls: ['aside-pane.components.scss'],
  templateUrl: './aside-pane.components.html'
})
export class AsidePaneComponent implements OnInit, OnChanges, OnDestroy {

  @Input() public autoFocus: boolean = false;
  @Output() public closeAsideEvent: EventEmitter<boolean> = new EventEmitter(true);
  @Output() public animatePaneAside: EventEmitter<any> = new EventEmitter();
  // @Input() public openGroupPane: boolean;

  // public
  public isAddStockOpen: boolean = false;
  public isAddGroupOpen: boolean = false;
  public isAddUnitOpen: boolean = false;
  public hideFirstScreen: boolean = false;
  public hideFirstStep: boolean = false;
  public openGroupAsidePane$: Observable<boolean>;
  public createGroupSuccess$: Observable<boolean>;
  public manageInProcess$: Observable<any>;
  public addGroup: boolean;
  public addStock: boolean;
  public createStockSuccess$: Observable<boolean>;
  public createCustomStockSuccess$: Observable<boolean>;
  public autoFocusOnChild: boolean = false;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private store: Store<AppState>,
    private inventoryAction: InventoryAction,
    private _router: Router,
  ) {
    this.createStockSuccess$ = this.store.select(s => s.inventory.createStockSuccess).pipe(takeUntil(this.destroyed$));
    this.createGroupSuccess$ = this.store.select(state => state.inventory.createGroupSuccess).pipe(takeUntil(this.destroyed$));
    this.createCustomStockSuccess$ = this.store.select(s => s.inventory.createCustomStockSuccess).pipe(takeUntil(this.destroyed$));
  }

  public ngOnInit() {
    this.createStockSuccess$.subscribe(s => {
      if (s) {        
        this.hideFirstScreen = false;
        this.isAddStockOpen = false;
      }
    });
    this.createGroupSuccess$.subscribe(s => {
      if (s) {
        this.hideFirstScreen = false;
        this.isAddGroupOpen = false;
      }
    });
    this.createCustomStockSuccess$.subscribe(s => {
      if (s) {
        // this.hideFirstScreen = false;
        // this.isAddUnitOpen = false;
      }
    });
  }

  public toggleStockPane() {
    this.hideFirstScreen = true;
    this.isAddStockOpen = false;
    this.isAddStockOpen = !this.isAddStockOpen;
  }

  public toggleGroupPane() {
    this.hideFirstScreen = true;
    this.isAddGroupOpen = false;
    this.isAddGroupOpen = !this.isAddGroupOpen;
  }

  public toggleUnitPane() {
    this.hideFirstScreen = true;
    this.isAddUnitOpen = false;
    this.isAddUnitOpen = !this.isAddUnitOpen;
  }
  public toggleImport() {
    this.closeAsidePane();
    this._router.navigate(['pages', 'import', 'stock']);
  }
  public backButtonPressed() {
    this.hideFirstScreen = false;
    this.isAddStockOpen = false;
    this.isAddGroupOpen = false;
    this.isAddUnitOpen = false;
  }
  public closeAsidePane(e?: any) {
    this.hideFirstStep = false;
    this.isAddStockOpen = false;
    this.isAddGroupOpen = false;
    this.isAddUnitOpen = false;
    this.addGroup = false;
    this.addStock = false;
    if (e) {
      //
    } else {
      this.store.dispatch(this.inventoryAction.OpenInventoryAsidePane(false));
      this.closeAsideEvent.emit();
      let objToSend = { isOpen: false, isGroup: false, isUpdate: false };
      this.store.dispatch(this.inventoryAction.ManageInventoryAside(objToSend));
    }
  }

  public animateAside(e: any) {
    this.animatePaneAside.emit(e);
  }

  public ngOnChanges(c) {
    if (c.autoFocus && c.autoFocus.currentValue) {
      this.autoFocusOnChild = true;
    } else {
      this.autoFocusOnChild = false;
    }
  }

  public ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

}
