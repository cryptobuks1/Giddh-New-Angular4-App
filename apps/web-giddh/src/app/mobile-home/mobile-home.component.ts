import { Component, OnInit, ChangeDetectorRef, HostListener, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommandKRequest } from '../models/api-models/Common';
import { Subject, ReplaySubject } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../store';
import { GeneralService } from '../services/general.service';
import { CommandKService } from '../services/commandk.service';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { remove } from '../lodash-optimized';

@Component({
    selector: 'mobile-home',
    templateUrl: './mobile-home.component.html',
    styleUrls: ['./mobile-home.component.scss']

})

export class MobileHomeComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('searchEle') public searchEle: ElementRef;
    
    public allowLoadMore: boolean = false;
    public isLoading: boolean = false;
    public activeCompanyUniqueName: any = '';
    public commandKRequestParams: CommandKRequest = {
        page: 1,
        q: '',
        group: '',
        totalPages: 1
    };
    public visibleItems: number = 10;
    private searchSubject: Subject<string> = new Subject();
    private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
    public searchedItems: any[] = [];
    public listOfSelectedGroups: any[] = [];
    public noResultsFound: boolean = false;

    constructor(private store: Store<AppState>, private _generalService: GeneralService, private _commandKService: CommandKService, private _cdref: ChangeDetectorRef) {
        this.store.pipe(select(p => p.session.companyUniqueName), takeUntil(this.destroyed$)).subscribe(res => {
            this.activeCompanyUniqueName = res;
        });
    }

    public ngOnInit(): void {
        // listen on input for search
        this.searchSubject.pipe(debounceTime(300)).subscribe(term => {
            this.commandKRequestParams.page = 1;
            this.commandKRequestParams.q = term;
            this.searchCommandK(true);
            this._cdref.markForCheck();
        });

        this.searchSubject.next("");
    }

    /**
     * This function gets called after view initializes and will
     * set focus in search box and will call function to adjust the width of container
     * @memberof CommandKComponent
     */
    public ngAfterViewInit(): void {
        setTimeout(() => {
            this.focusInSearchBox();
        }, 0);
    }

    /**
     * Releases all the observables to avoid memory leaks
     *
     * @memberof CommandKComponent
     */
    public ngOnDestroy(): void {
        this.destroyed$.next(true);
        this.destroyed$.complete();
    }

    public searchCommandK(resetItems: boolean): void | boolean {
        if (this.isLoading) {
            return false;
        }

        if (resetItems) {
            this.searchedItems = [];
        }

        this.isLoading = true;

        if (this.listOfSelectedGroups && this.listOfSelectedGroups.length > 0) {
            let lastGroup = this._generalService.getLastElement(this.listOfSelectedGroups);
            this.commandKRequestParams.group = lastGroup.uniqueName;
        } else {
            this.commandKRequestParams.group = "";
        }

        this._commandKService.searchCommandK(this.commandKRequestParams, this.activeCompanyUniqueName).subscribe((res) => {
            this.isLoading = false;

            if (res && res.body && res.body.results && res.body.results.length > 0) {
                let length = (this.searchedItems) ? this.searchedItems.length : 0;
                res.body.results.forEach((key, index) => {
                    key.loop = length + index;
                    this.searchedItems.push(key);
                });
                this.noResultsFound = false;
                this.allowLoadMore = true;
                this.commandKRequestParams.totalPages = res.body.totalPages;
                this._cdref.detectChanges();
            } else {
                if (this.searchedItems.length === 0) {
                    this.noResultsFound = true;
                    this.allowLoadMore = false;
                }
                this._cdref.detectChanges();
            }
        });
    }

    /**
     * This function will get called if pressed enter on any item
     *
     * @private
     * @memberof CommandKComponent
     */
    private captureValueFromList(): void {
        // if (this.virtualScrollElem) {
        //     let item = this.virtualScrollElem.activeItem();
        //     if (item) {
        //         this.itemSelected(item);
        //         if (item.type === 'GROUP') {
        //             this.searchedItems = [];
        //         }
        //     } else if (this.searchedItems && this.searchedItems.length === 1) {
        //         this.itemSelected(this.searchedItems[0]);
        //         if (item.type === 'GROUP') {
        //             this.searchedItems = [];
        //         }
        //     }
        // }
    }

    /**
     * This function will remove the selected groups in decending order
     * if we press backspace in search box
     * @param {*} [item]
     * @memberof CommandKComponent
     */
    public removeItemFromSelectedGroups(item?: any): void {
        if (item) {
            this.listOfSelectedGroups = remove(this.listOfSelectedGroups, o => item.uniqueName !== o.uniqueName);
        } else {
            this.listOfSelectedGroups.pop();
        }
    }

    /**
     * This function puts the focus in search box
     *
     * @param {KeyboardEvent} [e]
     * @memberof CommandKComponent
     */
    public focusInSearchBox(e?: KeyboardEvent): void {
        if (this.searchEle) {
            this.searchEle.nativeElement.focus();
        }
    }

    /**
     * This function returns the uniquename of item
     *
     * @param {*} index
     * @param {*} item
     * @returns uniqueName
     * @memberof CommandKComponent
     */
    public trackByFn(index, item: any) {
        return item.uniqueName; // unique id corresponding to the item
    }

    /**
     * This function will load more records on scroll
     *
     * @param {*} event
     * @memberof CommandKComponent
     */
    @HostListener('scroll', ['$event'])
    onScroll(event: any) {
        // visible height + pixel scrolled >= total height - 200 (deducted 200 to load list little earlier before user reaches to end)
        if (event.target.offsetHeight + event.target.scrollTop >= (event.target.scrollHeight - 200)) {
            if (this.allowLoadMore && !this.isLoading) {
                if (this.commandKRequestParams.page + 1 <= this.commandKRequestParams.totalPages) {
                    this.commandKRequestParams.page++;
                    this.searchCommandK(false);
                }
            }
        }
    }

    /**
     * This function will init search on keyup of search box
     *
     * @param {KeyboardEvent} e
     * @param {string} term
     * @returns {void}
     * @memberof CommandKComponent
     */
    public initSearch(e: KeyboardEvent, term: string): void {
        term = term.trim();
        this.searchSubject.next(term);
    }
}