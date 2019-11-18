import { Observable, of as observableOf, ReplaySubject } from 'rxjs';

import { distinctUntilChanged, take, takeUntil } from 'rxjs/operators';
import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { digitsOnly } from '../../../helpers';
import { AccountsAction } from '../../../../actions/accounts.actions';
import { AppState } from '../../../../store';
import { select, Store } from '@ngrx/store';
import { AccountRequestV2, AccountResponseV2, IAccountAddress } from '../../../../models/api-models/Account';
import { CompanyService } from '../../../../services/companyService.service';
import { contriesWithCodes, IContriesWithCodes } from '../../../helpers/countryWithCodes';
import { ToasterService } from '../../../../services/toaster.service';
import { CompanyResponse, StateList, StatesRequest } from '../../../../models/api-models/Company';
import { CompanyActions } from '../../../../actions/company.actions';
import * as _ from '../../../../lodash-optimized';
import { IOption } from '../../../../theme/ng-virtual-select/sh-options.interface';
import { ShSelectComponent } from '../../../../theme/ng-virtual-select/sh-select.component';
import { IForceClear } from "../../../../models/api-models/Sales";
import { CountryRequest, OnboardingFormRequest } from "../../../../models/api-models/Common";
import { CommonActions } from '../../../../actions/common.actions';
import { GeneralActions } from "../../../../actions/general/general.actions";
import { IFlattenGroupsAccountsDetail } from 'apps/web-giddh/src/app/models/interfaces/flattenGroupsAccountsDetail.interface';
import * as googleLibphonenumber from 'google-libphonenumber';

@Component({
    selector: 'account-update-new-details',
    styles: [`

    `],
    templateUrl: './account-update-new-details.component.html',
    styleUrls: ['./account-update-new-details.component.scss'],
})

export class AccountUpdateNewDetailsComponent implements OnInit, OnDestroy {
    public addAccountForm: FormGroup;
    @Input() public activeGroupUniqueName: string;
    @Input() public fetchingAccUniqueName$: Observable<boolean>;
    @Input() public createAccountInProcess$: Observable<boolean>;
    @Input() public createAccountIsSuccess$: Observable<boolean>;
    @Input() public isGstEnabledAcc: boolean = false;
    @Input() public activeAccount$: Observable<AccountResponseV2>;
    @Input() public isHsnSacEnabledAcc: boolean = false;
    @Input() public updateAccountInProcess$: Observable<boolean>;
    @Input() public updateAccountIsSuccess$: Observable<boolean>;
    @Input() public showBankDetail: boolean = false;
    @Input() public showVirtualAccount: boolean = false;
    @Input() public isDebtorCreditor: boolean = false;
    @Input() public showDeleteButton: boolean = true;
    @Input() public accountDetails: any;
    @ViewChild('autoFocusUpdate') public autoFocusUpdate: ElementRef;

    public activeCompany: CompanyResponse;
    @Output() public submitClicked: EventEmitter<{ value: { groupUniqueName: string, accountUniqueName: string }, accountRequest: AccountRequestV2 }>
        = new EventEmitter();
    @Output() public deleteClicked: EventEmitter<any> = new EventEmitter();
    public showOtherDetails: boolean = false;
    public partyTypeSource: IOption[] = [];
    public stateList: StateList[] = [];

    public states: any[] = [];
    public statesSource$: Observable<IOption[]> = observableOf([]);
    public companiesList$: Observable<CompanyResponse[]>;
    public moreGstDetailsVisible: boolean = false;
    public gstDetailsLength: number = 3;
    public isMultipleCurrency: boolean = false;
    public companyCurrency: string;
    public isIndia: boolean = false;
    public companyCountry: string = '';
    public activeAccountName: string = '';
    public forceClear$: Observable<IForceClear> = observableOf({status: false});
    public isDiscount: boolean = false;
    private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
    public countrySource: IOption[] = [];
    public countrySource$: Observable<IOption[]> = observableOf([]);
    public currencies: IOption[] = [];
    public currencySource$: Observable<IOption[]> = observableOf([]);
    public countryCurrency: any[] = [];
    public countryPhoneCode: IOption[] = [];
    public callingCodesSource$: Observable<IOption[]> = observableOf([]);
    public stateGstCode: any[] = [];
    public flatGroupsOptions: IOption[];
    public phoneUtility: any = googleLibphonenumber.PhoneNumberUtil.getInstance();
    public isMobileNumberValid: boolean = false;
    public formFields: any[] = [];
    public isGstValid: boolean;
    private flattenGroups$: Observable<IFlattenGroupsAccountsDetail[]>;

    constructor(private _fb: FormBuilder, private store: Store<AppState>, private accountsAction: AccountsAction,
                private _companyService: CompanyService, private _toaster: ToasterService, private companyActions: CompanyActions, private commonActions: CommonActions, private _generalActions: GeneralActions) {
        this.companiesList$ = this.store.select(s => s.session.companies).pipe(takeUntil(this.destroyed$));
        this.flattenGroups$ = this.store.pipe(select(state => state.general.flattenGroups), takeUntil(this.destroyed$));
        this.activeAccount$ = this.store.select(state => state.groupwithaccounts.activeAccount).pipe(takeUntil(this.destroyed$));

        this.getCountry();
        this.getCurrency();
        this.getCallingCodes();
        this.getPartyTypes();
    }

    public ngOnInit() {
        if (this.activeGroupUniqueName === 'discount') {
            this.isDiscount = true;
        }
        this.initializeNewForm();
        // fill form with active account
        this.activeAccount$.pipe(takeUntil(this.destroyed$)).subscribe(acc => {
            if (acc) {
                let accountDetails: AccountRequestV2 = acc as AccountRequestV2;
                this.addAccountForm.patchValue(accountDetails);

                // render gst details if there's no details add one automatically
                if (accountDetails.addresses.length > 0) {
                    accountDetails.addresses.map(a => {
                        this.renderGstDetails(a, accountDetails.addresses.length);
                    });
                }

                // hsn/sac enable disable
                if (acc.hsnNumber) {
                    this.addAccountForm.get('sacNumber').disable();
                    this.addAccountForm.get('hsnNumber').enable();
                    this.addAccountForm.get('hsnOrSac').patchValue('hsn');
                } else if (acc.sacNumber) {
                    this.addAccountForm.get('hsnNumber').disable();
                    this.addAccountForm.get('sacNumber').enable();
                    this.addAccountForm.get('hsnOrSac').patchValue('sac');
                }
                this.openingBalanceTypeChnaged(accountDetails.openingBalanceType);
                this.addAccountForm.patchValue(accountDetails);
                if (accountDetails.mobileNo) {
                    if (accountDetails.mobileNo.length > 10 && accountDetails.mobileNo.indexOf('-') > -1) {
                        let mobileArray = accountDetails.mobileNo.split('-');
                        this.addAccountForm.get('mobileCode').patchValue(mobileArray[0]);
                        this.addAccountForm.get('mobileNo').patchValue(mobileArray[1]);
                    } else {
                        this.addAccountForm.get('mobileNo').patchValue(accountDetails.mobileNo);
                    }
                } else {
                    this.addAccountForm.get('mobileNo').patchValue('');
                }
            }
        });
        this.addAccountForm.get('hsnOrSac').valueChanges.subscribe(a => {
            const hsn: AbstractControl = this.addAccountForm.get('hsnNumber');
            const sac: AbstractControl = this.addAccountForm.get('sacNumber');
            if (a === 'hsn') {
                sac.reset();
                hsn.enable();
                sac.disable();
            } else {
                hsn.reset();
                sac.enable();
                hsn.disable();
            }
        });
        this.flattenGroups$.subscribe(flattenGroups => {
            if (flattenGroups) {
                let items: IOption[] = flattenGroups.filter(grps => {
                    return grps.groupUniqueName === this.activeGroupUniqueName || grps.parentGroups.some(s => s.uniqueName === this.activeGroupUniqueName);
                }).map(m => {
                    return {
                        value: m.groupUniqueName, label: m.groupName
                    };
                });
                this.flatGroupsOptions = items;
            }
        });
        // get country code value change
        this.addAccountForm.get('country').get('countryCode').valueChanges.subscribe(a => {

            if (a) {
                const addresses = this.addAccountForm.get('addresses') as FormArray;
                let addressFormArray = (this.addAccountForm.controls['addresses'] as FormArray);
                let lengthofFormArray = addressFormArray.controls.length;
                if (a !== 'IN') {
                    this.isIndia = false;
                    Object.keys(addressFormArray.controls).forEach((key) => {
                        if (parseInt(key) > 0) {
                            addressFormArray.removeAt(1); // removing index 1 only because as soon as we remove any index, it automatically updates index
                        }
                    });
                } else {
                    if (addresses.controls.length === 0) {
                        this.addBlankGstForm();
                    }
                    this.isIndia = true;
                }

                this.resetGstStateForm();
            }
        });
        // get openingblance value changes
        this.addAccountForm.get('openingBalance').valueChanges.subscribe(a => {
            if (a && (a === 0 || a <= 0) && this.addAccountForm.get('openingBalanceType').value) {
                this.addAccountForm.get('openingBalanceType').patchValue('');
            } else if (a && (a === 0 || a > 0) && this.addAccountForm.get('openingBalanceType').value === '') {
                this.addAccountForm.get('openingBalanceType').patchValue('CREDIT');
            }
        });
        this.store.select(p => p.session.companyUniqueName).pipe(distinctUntilChanged()).subscribe(a => {
            if (a) {
                this.companiesList$.pipe(take(1)).subscribe(companies => {
                    this.activeCompany = companies.find(cmp => cmp.uniqueName === a);
                    if (this.activeCompany.countryV2 !== undefined && this.activeCompany.countryV2 !== null) {
                        this.getStates(this.activeCompany.countryV2.alpha2CountryCode);
                    }
                });
            }
        });

        this.store.select(s => s.session).pipe(takeUntil(this.destroyed$)).subscribe((session) => {
            let companyUniqueName: string;
            if (session.companyUniqueName) {
                companyUniqueName = _.cloneDeep(session.companyUniqueName);
            }
            if (session.companies && session.companies.length) {
                let companies = _.cloneDeep(session.companies);
                let currentCompany = companies.find((company) => company.uniqueName === companyUniqueName);
                if (currentCompany) {
                    // set country
                    this.setCountryByCompany(currentCompany);
                    this.companyCurrency = _.clone(currentCompany.baseCurrency);
                    this.isMultipleCurrency = _.clone(currentCompany.isMultipleCurrency);
                    // if (this.isMultipleCurrency) {
                    //     this.addAccountForm.get('currency').enable();
                    // } else {
                    //     this.addAccountForm.get('currency').disable();
                    // }
                }
            }
        });

        // COMMENTED BELOW CODE TO REMOVE AUTOCOMPLETE ON ACCOUNT NAME SINCE API TEAM IS HANDING THE ACCOUNT UNIQUE NAME
        // this.addAccountForm.get('name').valueChanges.pipe(debounceTime(100)).subscribe(name => {
        //   let val: string = name;
        //   val = uniqueNameInvalidStringReplace(val);
        //   if (val) {
        //     this.store.dispatch(this.accountsAction.getAccountUniqueName(val));
        //     this.isAccountNameAvailable$.subscribe(a => {
        //       if (a !== null && a !== undefined) {
        //         if (a) {
        //           this.addAccountForm.patchValue({ uniqueName: val });
        //         } else {
        //           let num = 1;
        //           this.addAccountForm.patchValue({ uniqueName: val + num });
        //         }
        //       }
        //     });
        //   } else {
        //     this.addAccountForm.patchValue({ uniqueName: '' });
        //   }
        // });

        if (this.autoFocusUpdate !== undefined) {
            setTimeout(() => {
                this.autoFocusUpdate.nativeElement.focus();
            }, 50);
        }
        this.store.pipe(select(s => s.common.onboardingform), takeUntil(this.destroyed$)).subscribe(res => {
            if (res) {
                Object.keys(res.fields).forEach(key => {
                    this.formFields[res.fields[key].name] = [];
                    this.formFields[res.fields[key].name] = res.fields[key];
                });

                // Object.keys(res.applicableTaxes).forEach(key => {
                //     this.taxesList.push({ label: res.applicableTaxes[key].name, value: res.applicableTaxes[key].uniqueName, isSelected: false });
                // });
            }
        });
    }

    public onViewReady(ev) {
        let accountCountry = this.addAccountForm.get('country').get('countryCode').value;
        if (accountCountry) {
            if (accountCountry !== 'IN') {
                // this.addAccountForm.controls['addresses'] = this._fb.array([]);
                this.isIndia = false;
            } else {
                const addresses = this.addAccountForm.get('addresses') as FormArray;
                if (addresses.controls.length === 0) {
                    this.addBlankGstForm();
                }
                this.isIndia = true;
            }
        }
    }

    public setCountryByCompany(company: CompanyResponse) {
        let result: IContriesWithCodes = contriesWithCodes.find((c) => c.countryName === company.country);
        if (result) {
            this.addAccountForm.get('country').get('countryCode').patchValue(result.countryflag);
            this.addAccountForm.get('mobileCode').patchValue(result.value);
            let stateObj = this.getStateGSTCode(this.stateList, result.countryflag);
            this.addAccountForm.get('currency').patchValue(company.baseCurrency);
            this.getOnboardingForm(result.countryflag);
            this.companyCountry = result.countryflag;
        } else {
            this.addAccountForm.get('country').get('countryCode').patchValue('IN');
            this.addAccountForm.get('mobileCode').patchValue('91');
            this.addAccountForm.get('currency').patchValue('IN');
            this.companyCountry = 'IN';
            this.getOnboardingForm('IN');
        }
    }

    public initializeNewForm() {
        this.addAccountForm = this._fb.group({
            name: ['', Validators.compose([Validators.required, Validators.maxLength(100)])],
            uniqueName: [''],
            openingBalanceType: ['CREDIT'],
            foreignOpeningBalance: [0],
            openingBalance: [0],
            mobileNo: [''],
            mobileCode: [''],
            email: ['', Validators.pattern(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)],
            companyName: [''],
            attentionTo: [''],
            description: [''],
            addresses: this._fb.array([]),
            country: this._fb.group({
                countryCode: ['']
            }),
            hsnOrSac: [''],
            currency: [''],
            hsnNumber: [{value: '', disabled: false}],
            sacNumber: [{value: '', disabled: false}],
            accountBankDetails: this._fb.array([
                this._fb.group({
                    bankName: [''],
                    bankAccountNo: [''],
                    ifsc: ['']
                })
            ]),
            cashFreeVirtualAccountData: this._fb.group({
                ifscCode: [''],
                name: [''],
                virtualAccountNumber: ['']
            }),
            closingBalanceTriggerAmount: [0, Validators.compose([digitsOnly])],
            closingBalanceTriggerAmountType: ['CREDIT']
        });
    }

    public initialGstDetailsForm(val: IAccountAddress = null): FormGroup {
        let gstFields = this._fb.group({
            gstNumber: ['', Validators.compose([Validators.maxLength(15)])],
            address: ['', Validators.maxLength(120)],
            state: this._fb.group({
                code: [''],
                name: [''],
                stateGstCode: ['']
            }),
            stateCode: [{value: '', disabled: false}],
            isDefault: [false],
            isComposite: [false],
            partyType: ['NOT APPLICABLE']
        });
        if (val) {
            // todo FIX THIS LATER
            val.state = val.state ? val.state : {code: '', stateGstCode: '', name: ''};
            gstFields.patchValue(val);
        }
        return gstFields;
    }

    public resetGstStateForm() {
        this.forceClear$ = observableOf({status: true});

        let addresses = this.addAccountForm.get('addresses') as FormArray;
        for (let control of addresses.controls) {
            control.get('stateCode').patchValue(null);
            control.get('state').get('code').patchValue(null);
            control.get('gstNumber').setValue("");
        }
    }

    public addGstDetailsForm(value: string) {
        if (value && !value.startsWith(' ', 0)) {
            const addresses = this.addAccountForm.get('addresses') as FormArray;
            addresses.push(this.initialGstDetailsForm(null));
        } else {
            this._toaster.clearAllToaster();
            this._toaster.errorToast('Please fill GSTIN field first');
        }
        return;
    }

    public removeGstDetailsForm(i: number) {
        const addresses = this.addAccountForm.get('addresses') as FormArray;
        addresses.removeAt(i);
    }

    public addBlankGstForm() {
        const addresses = this.addAccountForm.get('addresses') as FormArray;
        if (addresses.value.length === 0) {
            addresses.push(this.initialGstDetailsForm(null));
        }
    }

    public renderGstDetails(addressObj: IAccountAddress = null, addressLength: any) {
        const addresses = this.addAccountForm.get('addresses') as FormArray;
        if (addresses.length < addressLength) {
            addresses.push(this.initialGstDetailsForm(addressObj));
        }
    }

    public isDefaultAddressSelected(val: boolean, i: number) {
        if (val) {
            let addresses = this.addAccountForm.get('addresses') as FormArray;
            for (let control of addresses.controls) {
                control.get('isDefault').patchValue(false);
            }
            addresses.controls[i].get('isDefault').patchValue(true);
        }
    }

    public getStateCode(gstForm: FormGroup, statesEle: ShSelectComponent) {
        let gstVal: string = gstForm.get('gstNumber').value;

        if (gstVal.length !== 15) {
            gstForm.get('partyType').reset('NOT APPLICABLE');
        }

        if (gstVal.length >= 2) {
            this.statesSource$.pipe(take(1)).subscribe(state => {
                let stateCode = this.stateGstCode[gstVal.substr(0, 2)];

                let s = state.find(st => st.value === stateCode);
                statesEle.setDisabledState(false);
                if (s) {
                    gstForm.get('stateCode').patchValue(s.value);
                    gstForm.get('state').get('code').patchValue(s.value);
                    statesEle.setDisabledState(true);
                } else {
                    gstForm.get('stateCode').patchValue(null);
                    gstForm.get('state').get('code').patchValue(null);
                    statesEle.setDisabledState(false);
                    this._toaster.clearAllToaster();
                    this._toaster.warningToast('Invalid GSTIN.');
                }
            });
        } else {
            statesEle.setDisabledState(false);
            gstForm.get('stateCode').patchValue(null);
            gstForm.get('state').get('code').patchValue(null);

        }
    }

    public showMoreGst() {
        const addresses = this.addAccountForm.get('addresses') as FormArray;
        this.gstDetailsLength = addresses.controls.length;
        this.moreGstDetailsVisible = true;
    }

    public openingBalanceClick() {
        if (Number(this.addAccountForm.get('openingBalance').value) === 0) {
            this.addAccountForm.get('openingBalance').setValue(undefined);
        }
    }

    public openingBalanceTypeChnaged(type: string) {
        if (Number(this.addAccountForm.get('openingBalance').value) > 0) {
            this.addAccountForm.get('openingBalanceType').patchValue(type);
        }
    }

    public showLessGst() {
        this.gstDetailsLength = 3;
        this.moreGstDetailsVisible = false;
    }

    public resetUpdateAccountForm() {
        const addresses = this.addAccountForm.get('addresses') as FormArray;
        const countries = this.addAccountForm.get('country') as FormGroup;
        addresses.reset();
        countries.reset();
        this.addAccountForm.reset();
        this.addBlankGstForm();
    }

    public isValidMobileNumber(ele: HTMLInputElement) {
        if (ele.value) {
            this.checkMobileNo(ele);
        }
    }

    public checkMobileNo(ele) {
        try {
            let parsedNumber = this.phoneUtility.parse('+' + this.addAccountForm.get('mobileCode').value + ele.value, this.addAccountForm.get('country').get('countryCode').value);
            if (this.phoneUtility.isValidNumber(parsedNumber)) {
                ele.classList.remove('error-box');
                this.isMobileNumberValid = true;
            } else {
                this.isMobileNumberValid = false;
                this._toaster.errorToast('Invalid Contact number');
                ele.classList.add('error-box');
            }
        } catch (error) {
            this.isMobileNumberValid = false;
            this._toaster.errorToast('Invalid Contact number');
            ele.classList.add('error-box');
        }
    }

    public submit() {
        let accountRequest: AccountRequestV2 = this.addAccountForm.value as AccountRequestV2;

        if (this.accountDetails) {
            this.activeAccountName = this.accountDetails.uniqueName;
        } else {
            this.activeAccount$.pipe(take(1)).subscribe(a => this.activeAccountName = a.uniqueName);
        }
        if (this.stateList && accountRequest.addresses[0].stateCode) {
            let selectedStateObj = this.getStateGSTCode(this.stateList, accountRequest.addresses[0].stateCode);
            if (selectedStateObj.stateGstCode) {
                accountRequest.addresses[0].stateCode = selectedStateObj.stateGstCode;
            } else {
                accountRequest.addresses[0].stateCode = selectedStateObj.code;
            }
        }
        if (!accountRequest.mobileNo) {
            accountRequest.mobileCode = '';
        }
        if (this.isHsnSacEnabledAcc) {
            delete accountRequest['country'];
            delete accountRequest['addresses'];
            delete accountRequest['hsnOrSac'];
            delete accountRequest['mobileNo'];
            delete accountRequest['email'];
            delete accountRequest['attentionTo'];
        } else {
            delete accountRequest['hsnOrSac'];
            delete accountRequest['hsnNumber'];
            delete accountRequest['sacNumber'];

            accountRequest.addresses = accountRequest.addresses.map(f => {
                if (!f.partyType || f.partyType === '') {
                    f.partyType = 'NOT APPLICABLE';
                }
                return f;
            });

            if (accountRequest.mobileCode && accountRequest.mobileNo) {
                accountRequest.mobileNo = accountRequest.mobileNo;
                // delete accountRequest['mobileCode'];
            }
        }

        // if (this.showBankDetail) {
        //     if (!accountRequest['accountBankDetails'][0].bankAccountNo || !accountRequest['accountBankDetails'][0].ifsc) {
        //         accountRequest['accountBankDetails'] = [];
        //     }
        // } else {
        //     delete accountRequest['accountBankDetails'];
        // }

        if (!this.showVirtualAccount) {
            delete accountRequest['cashFreeVirtualAccountData'];
        }

        if (this.activeGroupUniqueName === 'discount') {
            delete accountRequest['addresses'];
        }

        if (!this.showVirtualAccount) {
            delete accountRequest['cashFreeVirtualAccountData'];
        }

        if (!this.showBankDetail) {
            delete accountRequest['accountBankDetails'];
        }
        this.submitClicked.emit({
            value: {groupUniqueName: this.activeGroupUniqueName, accountUniqueName: this.activeAccountName},
            accountRequest: this.addAccountForm.value
        });
    }

    public closingBalanceTypeChanged(type: string) {
        if (Number(this.addAccountForm.get('closingBalanceTriggerAmount').value) > 0) {
            this.addAccountForm.get('closingBalanceTriggerAmountType').patchValue(type);
        }
    }

    // /**
    //  * ngOnChanges
    //  */
    // public ngOnChanges(s) {
    //     if (s && s['showVirtualAccount'] && s['showVirtualAccount'].currentValue) {
    //         // console.log(s['showVirtualAccount'].currentValue);
    //         this.showOtherDetails = true;
    //     }
    // }

    public ngOnDestroy() {
        this.resetUpdateAccountForm();
        this.destroyed$.next(true);
        this.destroyed$.complete();
    }

    public selectCountry(event: IOption) {
        if (event) {
            this.getOnboardingForm(event.value);
            let phoneCode = event.additional;
            this.addAccountForm.get('mobileCode').setValue(phoneCode);
            let currencyCode = this.countryCurrency[event.value];
            this.addAccountForm.get('currency').setValue(currencyCode);
            this.getStates(event.value);

        }
    }

    public selectedState(gstForm: FormGroup, event) {
        if (gstForm && event.label) {
            let obj = this.getStateGSTCode(this.stateList, event.value);
            gstForm.get('stateCode').patchValue(event.value);
            gstForm.get('state').get('code').patchValue(event.value);
        }

    }

    public selectGroup(event: IOption) {
        if (event) {
            this.activeGroupUniqueName = event.value;
        }
    }

    public getCountry() {
        this.store.pipe(select(s => s.common.countries), takeUntil(this.destroyed$)).subscribe(res => {
            if (res) {
                Object.keys(res).forEach(key => {
                    this.countrySource.push({value: res[key].alpha2CountryCode, label: res[key].alpha2CountryCode + ' - ' + res[key].countryName, additional: res[key].callingCode});
                    // Creating Country Currency List
                    if (res[key].currency !== undefined && res[key].currency !== null) {
                        this.countryCurrency[res[key].alpha2CountryCode] = [];
                        this.countryCurrency[res[key].alpha2CountryCode] = res[key].currency.code;
                    }
                });
                this.countrySource$ = observableOf(this.countrySource);
            } else {
                let countryRequest = new CountryRequest();
                countryRequest.formName = '';
                this.store.dispatch(this.commonActions.GetCountry(countryRequest));
            }
        });
    }

    public getOnboardingForm(countryCode: string) {
        let onboardingFormRequest = new OnboardingFormRequest();
        onboardingFormRequest.formName = '';
        onboardingFormRequest.country = countryCode;
        this.store.dispatch(this.commonActions.GetOnboardingForm(onboardingFormRequest));
    }

    public getCurrency() {
        this.store.pipe(select(s => s.common.currencies), takeUntil(this.destroyed$)).subscribe(res => {
            if (res) {
                Object.keys(res).forEach(key => {
                    this.currencies.push({label: res[key].code, value: res[key].code});

                });
                this.currencySource$ = observableOf(this.currencies);
            } else {
                this.store.dispatch(this.commonActions.GetCurrency());
            }
        });
    }

    public getCallingCodes() {
        this.store.pipe(select(s => s.common.callingcodes), takeUntil(this.destroyed$)).subscribe(res => {
            if (res) {
                Object.keys(res.callingCodes).forEach(key => {
                    this.countryPhoneCode.push({label: res.callingCodes[key], value: res.callingCodes[key]});
                });
                this.callingCodesSource$ = observableOf(this.countryPhoneCode);
            } else {
                this.store.dispatch(this.commonActions.GetCallingCodes());
            }
        });
    }

    public checkGstNumValidation(ele: HTMLInputElement) {
        let isValid: boolean = false;

        if (ele.value) {
            if (this.formFields['taxName']['regex'] !== "" && this.formFields['taxName']['regex'].length > 0) {
                for (let key = 0; key < this.formFields['taxName']['regex'].length; key++) {
                    let regex = new RegExp(this.formFields['taxName']['regex'][key]);
                    if (regex.test(ele.value)) {
                        isValid = true;
                        break;
                    }
                }
            } else {
                isValid = true;
            }

            if (!isValid) {
                this._toaster.errorToast('Invalid ' + this.formFields['taxName'].label);
                ele.classList.add('error-box');
                this.isGstValid = false;
            } else {
                ele.classList.remove('error-box');
                this.isGstValid = true;
            }
        } else {
            ele.classList.remove('error-box');
        }
    }

    public getStates(countryCode) {
        this.store.dispatch(this._generalActions.resetStatesList());
        this.store.pipe(select(s => s.general.states), takeUntil(this.destroyed$)).subscribe(res => {
            if (res) {
                this.states = [];
                if (res.stateList) {
                    this.stateList = res.stateList;
                }
                Object.keys(res.stateList).forEach(key => {

                    if (res.stateList[key].stateGstCode !== null) {
                        this.stateGstCode[res.stateList[key].stateGstCode] = [];
                        this.stateGstCode[res.stateList[key].stateGstCode] = res.stateList[key].code;
                    }

                    this.states.push({label: res.stateList[key].code + ' - ' + res.stateList[key].name, value: res.stateList[key].code});
                });
                this.statesSource$ = observableOf(this.states);
            } else {
                let statesRequest = new StatesRequest();
                statesRequest.country = countryCode;
                this.store.dispatch(this._generalActions.getAllState(statesRequest));
            }
        });
    }

    public getPartyTypes() {
        this.store.pipe(select(s => s.common.partyTypes), takeUntil(this.destroyed$)).subscribe(res => {
            if (res) {
                this.partyTypeSource = res;
            } else {
                this.store.dispatch(this.commonActions.GetPartyType());
            }
        });
    }

    private getStateGSTCode(stateList, code: string) {
        return stateList.find(res => code === res.code);
    }

}
