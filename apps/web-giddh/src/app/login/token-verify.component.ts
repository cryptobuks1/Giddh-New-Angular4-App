import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReplaySubject } from 'rxjs';
import { LoginActions } from '../actions/login.action';
import { Store } from '@ngrx/store';
import { AppState } from '../store';
import { GeneralService } from '../services/general.service';

@Component({
    template: `<h2>Please wait...</h2>`
})
export class TokenVerifyComponent implements OnInit, OnDestroy {
    public loading = false;
    public returnUrl: string;
    public token: string;
    public request: string;
    private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

    constructor(
        private route: ActivatedRoute,
        private store: Store<AppState>,
        private _generalService: GeneralService,
        private _loginAction: LoginActions,
    ) {
    }

    public ngOnDestroy() {
        this.destroyed$.next(true);
        this.destroyed$.complete();
    }

    public ngOnInit() {
        this._generalService.storeUtmParameters(this.route.snapshot.queryParams);

        if (this.route.snapshot.queryParams['token']) {
            this.token = this.route.snapshot.queryParams['token'];
            this.verifyToken();
        }

        if (this.route.snapshot.queryParams['request']) {
            this.request = this.route.snapshot.queryParams['request'];
            this.verifyUser();
        }
    }

    public verifyToken() {
        this.store.dispatch(this._loginAction.signupWithGoogle(this.token));
    }

    public verifyUser() {
        let obj = JSON.parse(this.request);
        this.store.dispatch(this._loginAction.LoginWithPasswdResponse(obj));
    }
}
