(window.webpackJsonp=window.webpackJsonp||[]).push([[1],{CMgj:function(l,n,e){"use strict";var u=e("mhnT"),t=e("D57K"),o=e("leiK"),a=e("Lh+r"),i=function(){function l(l,n){this.keySelector=l,this.flushes=n}return l.prototype.call=function(l,n){return n.subscribe(new r(l,this.keySelector,this.flushes))},l}(),r=function(l){function n(n,e,u){var t=l.call(this,n)||this;return t.keySelector=e,t.values=new Set,u&&t.add(Object(a.a)(t,u)),t}return t.__extends(n,l),n.prototype.notifyNext=function(l,n,e,u,t){this.values.clear()},n.prototype.notifyError=function(l,n){this._error(l)},n.prototype._next=function(l){this.keySelector?this._useKeySelector(l):this._finalizeNext(l,l)},n.prototype._useKeySelector=function(l){var n,e=this.destination;try{n=this.keySelector(l)}catch(u){return void e.error(u)}this._finalizeNext(n,l)},n.prototype._finalizeNext=function(l,n){var e=this.values;e.has(l)||(e.add(l),this.destination.next(n))},n}(o.a),s=e("Zl8a"),c=e("ULJ3"),d=(e("PhKm"),function(){return function(){}}()),g=(e("9fUo"),e("dHrK")),p=e("wgY5"),f=e("hqKg");e.d(n,"a",function(){return v});var h=[{label:"Greater",value:"greaterThan"},{label:"Less Than",value:"lessThan"},{label:"Greater Than or Equals",value:"greaterThanOrEquals"},{label:"Less Than or Equals",value:"lessThanOrEquals"},{label:"Equals",value:"equals"}],m=[{label:"Quantity Inward",value:"quantityInward"},{label:"Voucher Number",value:"voucherNumber"}],v=function(){function l(l,n,e,t){this.store=l,this.manufacturingActions=n,this.inventoryAction=e,this.router=t,this.mfStockSearchRequest=new d,this.filtersForSearchBy=m,this.filtersForSearchOperation=h,this.stockListDropDown=[],this.reportData=null,this.showFromDatePicker=!1,this.showToDatePicker=!1,this.moment=p,this.isUniversalDateApplicable=!1,this.lastPage=0,this.destroyed$=new s.a(1),this.mfStockSearchRequest.product="",this.mfStockSearchRequest.searchBy="",this.mfStockSearchRequest.searchOperation="",this.isReportLoading$=this.store.select(function(l){return l.manufacturing.isMFReportLoading}).pipe(Object(u.a)(this.destroyed$))}return l.prototype.ngOnInit=function(){var l,n=this;this.initializeSearchReqObj(),this.store.dispatch(this.inventoryAction.GetManufacturingStock()),this.store.select(function(l){return l.inventory.manufacturingStockList}).pipe(Object(u.a)(this.destroyed$)).subscribe(function(l){l?l.results&&(n.stockListDropDown=[],g.forEach(l.results,function(l){n.stockListDropDown.push({label:" "+l.name+" ("+l.uniqueName+")",value:l.uniqueName,additional:l.stockGroup})})):n.store.dispatch(n.inventoryAction.GetManufacturingStock())}),this.store.select(function(l){return l.manufacturing.reportData}).pipe(Object(u.a)(this.destroyed$)).subscribe(function(l){l&&(n.reportData=g.cloneDeep(l))}),this.store.select(function(l){return l.session.companyUniqueName}).pipe(Object(u.a)(this.destroyed$),(l=function(l){return"companyUniqueName"===l},function(n){return n.lift(new i(l,void 0))})).subscribe(function(l){n.store.dispatch(n.inventoryAction.GetManufacturingStock())}),this.store.select(Object(f.createSelector)([function(l){return l.session.applicationDate}],function(l){l&&(n.universalDate=g.cloneDeep(l),n.mfStockSearchRequest.dateRange=n.universalDate,n.isUniversalDateApplicable=!0,n.getReportDataOnFresh())})).subscribe()},l.prototype.initializeSearchReqObj=function(){this.mfStockSearchRequest.product="",this.mfStockSearchRequest.searchBy="",this.mfStockSearchRequest.searchOperation="",this.mfStockSearchRequest.page=1,this.mfStockSearchRequest.count=20},l.prototype.goToCreateNewPage=function(){this.store.dispatch(this.manufacturingActions.RemoveMFItemUniqueNameFomStore()),this.router.navigate(["/pages/manufacturing/edit"])},l.prototype.getReports=function(){this.store.dispatch(this.manufacturingActions.GetMfReport(this.mfStockSearchRequest))},l.prototype.pageChanged=function(l){if(l.page!==this.lastPage){this.lastPage=l.page;var n=g.cloneDeep(this.mfStockSearchRequest);n.page=l.page,this.store.dispatch(this.manufacturingActions.GetMfReport(n))}},l.prototype.editMFItem=function(l){l.uniqueName&&(this.store.dispatch(this.manufacturingActions.SetMFItemUniqueNameInStore(l.uniqueName)),this.router.navigate(["/pages/manufacturing/edit"]))},l.prototype.getReportDataOnFresh=function(){var l=g.cloneDeep(this.mfStockSearchRequest);this.universalDate?(l.from=p(this.universalDate[0]).format(c.a),l.to=p(this.universalDate[1]).format(c.a)):(l.from=p().subtract(30,"days").format(c.a),l.to=p().format(c.a)),this.store.dispatch(this.manufacturingActions.GetMfReport(l))},l.prototype.clearDate=function(l){this.mfStockSearchRequest[l]=""},l.prototype.setToday=function(l){this.mfStockSearchRequest[l]=p()},l.prototype.bsValueChange=function(l){l&&(this.mfStockSearchRequest.from=p(l[0]).format(c.a),this.mfStockSearchRequest.to=p(l[1]).format(c.a))},l.prototype.setActiveStockGroup=function(l){this.activeStockGroup=l.additional.uniqueName},l.prototype.ngOnDestroy=function(){this.destroyed$.next(!0),this.destroyed$.complete()},l}()},o1LF:function(l,n,e){"use strict";var u=e("LoAr"),t=e("WT9V"),o=e("r67W"),a=e("q37T"),i=e("VCDu"),r=e("IfiR"),s=e("Rzvk"),c=e("BuFo"),d=e("mC8G"),g=e("Q00F"),p=e("ecKS"),f=e("0C15"),h=e("klEI"),m=e("gkmW"),v=e("GovN"),C=e("CMgj"),S=e("PhKm"),R=e("9fUo"),b=e("981U");e.d(n,"b",function(){return k}),e.d(n,"c",function(){return P}),e.d(n,"a",function(){return I});var k=u["\u0275crt"]({encapsulation:0,styles:[[".mfStockSearchRequestForm[_ngcontent-%COMP%]   .col-xs-1[_ngcontent-%COMP%]{width:11.33333333%}#mfReportTbl[_ngcontent-%COMP%]   .table[_ngcontent-%COMP%]   .table[_ngcontent-%COMP%]   td[_ngcontent-%COMP%]{border:none;text-align:center;padding:1px 0}#mfReportTbl[_ngcontent-%COMP%]   .table[_ngcontent-%COMP%]   td[_ngcontent-%COMP%]{vertical-align:top!important;text-transform:capitalize}#mfReportTbl[_ngcontent-%COMP%]   .table[_ngcontent-%COMP%]   td.noBdr[_ngcontent-%COMP%]{border:none}.pdBth4[_ngcontent-%COMP%]{padding:0 40px}"]],data:{}});function y(l){return u["\u0275vid"](0,[(l()(),u["\u0275eld"](0,0,null,null,2,"section",[["class","clearfix mart100 col-xs-12"]],null,null,null,null,null)),(l()(),u["\u0275eld"](1,0,null,null,1,"p",[["class","lead alC mrT4"]],null,null,null,null,null)),(l()(),u["\u0275ted"](-1,null,["Loading..."]))],null,null)}function N(l){return u["\u0275vid"](0,[(l()(),u["\u0275eld"](0,0,null,null,4,"div",[["class","no-data mart100 col-xs-12"]],null,null,null,null,null)),(l()(),u["\u0275eld"](1,0,null,null,1,"h1",[],null,null,null,null,null)),(l()(),u["\u0275ted"](-1,null,["No entries found within given criteria."])),(l()(),u["\u0275eld"](3,0,null,null,1,"h1",[],null,null,null,null,null)),(l()(),u["\u0275ted"](-1,null,["Do search with some other dates"]))],null,null)}function D(l){return u["\u0275vid"](0,[(l()(),u["\u0275eld"](0,0,null,null,6,"tr",[],null,null,null,null,null)),(l()(),u["\u0275eld"](1,0,null,null,1,"td",[],null,null,null,null,null)),(l()(),u["\u0275ted"](2,null,["",""])),(l()(),u["\u0275eld"](3,0,null,null,1,"td",[],null,null,null,null,null)),(l()(),u["\u0275ted"](-1,null,["\xa0"])),(l()(),u["\u0275eld"](5,0,null,null,1,"td",[],null,null,null,null,null)),(l()(),u["\u0275ted"](6,null,[""," ",""]))],null,function(l,n){l(n,2,0,n.context.$implicit.stockName),l(n,6,0,n.context.$implicit.manufacturingQuantity,n.context.$implicit.manufacturingUnit)})}function O(l){return u["\u0275vid"](0,[(l()(),u["\u0275eld"](0,0,null,null,18,"tr",[["class","cp"]],null,[[null,"dblclick"]],function(l,n,e){var u=!0;return"dblclick"===n&&(u=!1!==l.component.editMFItem(l.context.$implicit)&&u),u},null,null)),(l()(),u["\u0275eld"](1,0,null,null,1,"td",[],null,null,null,null,null)),(l()(),u["\u0275ted"](2,null,["",""])),(l()(),u["\u0275eld"](3,0,null,null,1,"td",[],null,null,null,null,null)),(l()(),u["\u0275ted"](4,null,["",""])),(l()(),u["\u0275eld"](5,0,null,null,1,"td",[],null,null,null,null,null)),(l()(),u["\u0275ted"](6,null,["",""])),(l()(),u["\u0275eld"](7,0,null,null,11,"td",[["class",""],["colspan","3"]],null,null,null,null,null)),(l()(),u["\u0275eld"](8,0,null,null,10,"table",[["class","table"]],null,null,null,null,null)),(l()(),u["\u0275eld"](9,0,null,null,9,"tbody",[],null,null,null,null,null)),(l()(),u["\u0275eld"](10,0,null,null,6,"tr",[],null,null,null,null,null)),(l()(),u["\u0275eld"](11,0,null,null,1,"td",[["width","40%"]],null,null,null,null,null)),(l()(),u["\u0275ted"](-1,null,["\xa0"])),(l()(),u["\u0275eld"](13,0,null,null,1,"td",[["width","20%"]],null,null,null,null,null)),(l()(),u["\u0275ted"](14,null,[""," ",""])),(l()(),u["\u0275eld"](15,0,null,null,1,"td",[["width","40%"]],null,null,null,null,null)),(l()(),u["\u0275ted"](-1,null,["\xa0"])),(l()(),u["\u0275and"](16777216,null,null,1,null,D)),u["\u0275did"](18,278528,null,0,t.NgForOf,[u.ViewContainerRef,u.TemplateRef,u.IterableDiffers],{ngForOf:[0,"ngForOf"]},null)],function(l,n){l(n,18,0,n.context.$implicit.linkedStocks)},function(l,n){l(n,2,0,n.context.$implicit.date),l(n,4,0,n.context.$implicit.voucherNumber),l(n,6,0,n.context.$implicit.stockName),l(n,14,0,n.context.$implicit.manufacturingQuantity,n.context.$implicit.manufacturingUnit)})}function T(l){return u["\u0275vid"](0,[(l()(),u["\u0275eld"](0,0,null,null,7,"div",[["class","paginationWrapper"]],null,null,null,null,null)),(l()(),u["\u0275eld"](1,0,null,null,6,"div",[["class","alC"]],null,null,null,null,null)),(l()(),u["\u0275eld"](2,0,null,null,5,"pagination",[["class","pagination-sm"]],[[2,"ng-untouched",null],[2,"ng-touched",null],[2,"ng-pristine",null],[2,"ng-dirty",null],[2,"ng-valid",null],[2,"ng-invalid",null],[2,"ng-pending",null]],[[null,"ngModelChange"],[null,"pageChanged"]],function(l,n,e){var u=!0,t=l.component;return"ngModelChange"===n&&(u=!1!==(t.reportData.page=e)&&u),"pageChanged"===n&&(u=!1!==t.pageChanged(e)&&u),u},o.c,o.b)),u["\u0275did"](3,114688,null,0,a.a,[u.Renderer2,u.ElementRef,i.a,u.ChangeDetectorRef],{maxSize:[0,"maxSize"],boundaryLinks:[1,"boundaryLinks"],rotate:[2,"rotate"],itemsPerPage:[3,"itemsPerPage"],totalItems:[4,"totalItems"]},{pageChanged:"pageChanged"}),u["\u0275prd"](1024,null,r.NG_VALUE_ACCESSOR,function(l){return[l]},[a.a]),u["\u0275did"](5,671744,null,0,r.NgModel,[[8,null],[8,null],[8,null],[6,r.NG_VALUE_ACCESSOR]],{model:[0,"model"]},{update:"ngModelChange"}),u["\u0275prd"](2048,null,r.NgControl,null,[r.NgModel]),u["\u0275did"](7,16384,null,0,r.NgControlStatus,[[4,r.NgControl]],null,null)],function(l,n){var e=n.component;l(n,3,0,5,!0,!1,20,e.reportData.totalItems),l(n,5,0,e.reportData.page)},function(l,n){l(n,2,0,u["\u0275nov"](n,7).ngClassUntouched,u["\u0275nov"](n,7).ngClassTouched,u["\u0275nov"](n,7).ngClassPristine,u["\u0275nov"](n,7).ngClassDirty,u["\u0275nov"](n,7).ngClassValid,u["\u0275nov"](n,7).ngClassInvalid,u["\u0275nov"](n,7).ngClassPending)})}function q(l){return u["\u0275vid"](0,[(l()(),u["\u0275eld"](0,0,null,null,22,"section",[],null,null,null,null,null)),(l()(),u["\u0275eld"](1,0,null,null,21,"div",[["class",""],["id","mfReportTbl"]],null,null,null,null,null)),(l()(),u["\u0275eld"](2,0,null,null,20,"div",[["class","col-xs-12"]],null,null,null,null,null)),(l()(),u["\u0275eld"](3,0,null,null,17,"table",[["class","table basic table-bordered"]],null,null,null,null,null)),(l()(),u["\u0275eld"](4,0,null,null,13,"thead",[],null,null,null,null,null)),(l()(),u["\u0275eld"](5,0,null,null,12,"tr",[],null,null,null,null,null)),(l()(),u["\u0275eld"](6,0,null,null,1,"th",[["width","15%"]],null,null,null,null,null)),(l()(),u["\u0275ted"](-1,null,["Date"])),(l()(),u["\u0275eld"](8,0,null,null,1,"th",[["width","10%"]],null,null,null,null,null)),(l()(),u["\u0275ted"](-1,null,["Vch. No."])),(l()(),u["\u0275eld"](10,0,null,null,1,"th",[["width","15%"]],null,null,null,null,null)),(l()(),u["\u0275ted"](-1,null,["Final Product"])),(l()(),u["\u0275eld"](12,0,null,null,1,"th",[["class","alC"],["width","24%"]],null,null,null,null,null)),(l()(),u["\u0275ted"](-1,null,["Raw Products"])),(l()(),u["\u0275eld"](14,0,null,null,1,"th",[["class","alC"],["width","12%"]],null,null,null,null,null)),(l()(),u["\u0275ted"](-1,null,["Product Inwards"])),(l()(),u["\u0275eld"](16,0,null,null,1,"th",[["class","alC"],["width","24%"]],null,null,null,null,null)),(l()(),u["\u0275ted"](-1,null,["Quantity Outwards"])),(l()(),u["\u0275eld"](18,0,null,null,2,"tbody",[],null,null,null,null,null)),(l()(),u["\u0275and"](16777216,null,null,1,null,O)),u["\u0275did"](20,278528,null,0,t.NgForOf,[u.ViewContainerRef,u.TemplateRef,u.IterableDiffers],{ngForOf:[0,"ngForOf"]},null),(l()(),u["\u0275and"](16777216,null,null,1,null,T)),u["\u0275did"](22,16384,null,0,t.NgIf,[u.ViewContainerRef,u.TemplateRef],{ngIf:[0,"ngIf"]},null)],function(l,n){var e=n.component;l(n,20,0,e.reportData.results),l(n,22,0,(null==e.reportData?null:e.reportData.totalPages)>1)},null)}function P(l){return u["\u0275vid"](0,[(l()(),u["\u0275eld"](0,0,null,null,94,"section",[["class","clearfix"],["id","manufacture"]],null,null,null,null,null)),(l()(),u["\u0275eld"](1,0,null,null,5,"div",[["class","top_bar col-xs-12 clearfix bdrB"]],null,null,null,null,null)),(l()(),u["\u0275eld"](2,0,null,null,2,"h1",[["class","section_title d-inline-block"]],null,null,null,null,null)),(l()(),u["\u0275eld"](3,0,null,null,1,"strong",[],null,null,null,null,null)),(l()(),u["\u0275ted"](-1,null,["Mfg. Journal Register"])),(l()(),u["\u0275eld"](5,0,null,null,1,"button",[["class","btn isActive pull-right"],["type","button"]],null,[[null,"click"]],function(l,n,e){var u=!0;return"click"===n&&(u=!1!==l.component.goToCreateNewPage()&&u),u},null,null)),(l()(),u["\u0275ted"](-1,null,["Create Manufacture"])),(l()(),u["\u0275eld"](7,0,null,null,78,"div",[["class","col-xs-12"]],null,null,null,null,null)),(l()(),u["\u0275eld"](8,0,null,null,77,"div",[["class","mfStockSearchRequestForm clearfix"]],null,null,null,null,null)),(l()(),u["\u0275eld"](9,0,null,null,76,"form",[["autocomplete","off"],["class","col-xs-10 mrT2 mrB"],["novalidate",""]],[[2,"ng-untouched",null],[2,"ng-touched",null],[2,"ng-pristine",null],[2,"ng-dirty",null],[2,"ng-valid",null],[2,"ng-invalid",null],[2,"ng-pending",null]],[[null,"submit"],[null,"reset"]],function(l,n,e){var t=!0,o=l.component;return"submit"===n&&(t=!1!==u["\u0275nov"](l,11).onSubmit(e)&&t),"reset"===n&&(t=!1!==u["\u0275nov"](l,11).onReset()&&t),"submit"===n&&(t=!1!==o.getReports()&&t),t},null,null)),u["\u0275did"](10,16384,null,0,r["\u0275angular_packages_forms_forms_bh"],[],null,null),u["\u0275did"](11,4210688,[["mfStockSearchRequestForm",4]],0,r.NgForm,[[8,null],[8,null]],null,null),u["\u0275prd"](2048,null,r.ControlContainer,null,[r.NgForm]),u["\u0275did"](13,16384,null,0,r.NgControlStatusGroup,[[4,r.ControlContainer]],null,null),(l()(),u["\u0275eld"](14,0,null,null,71,"div",[["class","row"]],null,null,null,null,null)),(l()(),u["\u0275eld"](15,0,null,null,13,"div",[["class","form-group col-xs-3"]],null,null,null,null,null)),(l()(),u["\u0275eld"](16,0,null,null,12,"div",[["class","row"]],null,null,null,null,null)),(l()(),u["\u0275eld"](17,0,null,null,1,"label",[["class","d-block"]],null,null,null,null,null)),(l()(),u["\u0275ted"](-1,null,["Final Product"])),(l()(),u["\u0275eld"](19,0,null,null,9,"sh-select",[["name","product"],["placeholder","--Select Product--"],["required",""]],[[1,"required",0],[2,"ng-untouched",null],[2,"ng-touched",null],[2,"ng-pristine",null],[2,"ng-dirty",null],[2,"ng-valid",null],[2,"ng-invalid",null],[2,"ng-pending",null]],[[null,"ngModelChange"],[null,"selected"],["window","mouseup"]],function(l,n,e){var t=!0,o=l.component;return"window:mouseup"===n&&(t=!1!==u["\u0275nov"](l,22).onDocumentClick(e)&&t),"ngModelChange"===n&&(t=!1!==(o.mfStockSearchRequest.product=e)&&t),"selected"===n&&(t=!1!==o.setActiveStockGroup(e)&&t),t},s.b,s.a)),u["\u0275did"](20,16384,null,0,r.RequiredValidator,[],{required:[0,"required"]},null),u["\u0275prd"](1024,null,r.NG_VALIDATORS,function(l){return[l]},[r.RequiredValidator]),u["\u0275did"](22,4833280,null,2,c.a,[u.ElementRef,u.Renderer,u.ChangeDetectorRef],{placeholder:[0,"placeholder"],ItemHeight:[1,"ItemHeight"],options:[2,"options"]},{selected:"selected"}),u["\u0275qud"](335544320,1,{notFoundLinkTemplate:0}),u["\u0275qud"](335544320,2,{optionTemplate:0}),u["\u0275prd"](1024,null,r.NG_VALUE_ACCESSOR,function(l){return[l]},[c.a]),u["\u0275did"](26,671744,[["productList",4]],0,r.NgModel,[[2,r.ControlContainer],[6,r.NG_VALIDATORS],[8,null],[6,r.NG_VALUE_ACCESSOR]],{name:[0,"name"],model:[1,"model"]},{update:"ngModelChange"}),u["\u0275prd"](2048,null,r.NgControl,null,[r.NgModel]),u["\u0275did"](28,16384,null,0,r.NgControlStatus,[[4,r.NgControl]],null,null),(l()(),u["\u0275eld"](29,0,null,null,16,"div",[["class","form-group col-xs-3"]],null,null,null,null,null)),(l()(),u["\u0275eld"](30,0,null,null,1,"label",[["class","d-block"]],null,null,null,null,null)),(l()(),u["\u0275ted"](-1,null,["From - To"])),(l()(),u["\u0275eld"](32,0,null,null,13,"div",[["class","input-group"]],null,null,null,null,null)),(l()(),u["\u0275eld"](33,16777216,[["dp",1]],null,9,"input",[["bsDaterangepicker",""],["class","form-control"],["name","dateRange"],["placeholder","Date range picker"],["required",""],["type","text"]],[[1,"required",0],[2,"ng-untouched",null],[2,"ng-touched",null],[2,"ng-pristine",null],[2,"ng-dirty",null],[2,"ng-valid",null],[2,"ng-invalid",null],[2,"ng-pending",null]],[[null,"bsValueChange"],[null,"input"],[null,"blur"],[null,"compositionstart"],[null,"compositionend"],[null,"change"],[null,"keyup.esc"]],function(l,n,e){var t=!0,o=l.component;return"input"===n&&(t=!1!==u["\u0275nov"](l,34)._handleInput(e.target.value)&&t),"blur"===n&&(t=!1!==u["\u0275nov"](l,34).onTouched()&&t),"compositionstart"===n&&(t=!1!==u["\u0275nov"](l,34)._compositionStart()&&t),"compositionend"===n&&(t=!1!==u["\u0275nov"](l,34)._compositionEnd(e.target.value)&&t),"change"===n&&(t=!1!==u["\u0275nov"](l,37).onChange(e)&&t),"keyup.esc"===n&&(t=!1!==u["\u0275nov"](l,37).hide()&&t),"blur"===n&&(t=!1!==u["\u0275nov"](l,37).onBlur()&&t),"bsValueChange"===n&&(t=!1!==o.bsValueChange(e)&&t),t},null,null)),u["\u0275did"](34,16384,null,0,r.DefaultValueAccessor,[u.Renderer2,u.ElementRef,[2,r.COMPOSITION_BUFFER_MODE]],null,null),u["\u0275did"](35,16384,null,0,r.RequiredValidator,[],{required:[0,"required"]},null),u["\u0275did"](36,737280,null,0,d.a,[g.a,u.ElementRef,u.Renderer2,u.ViewContainerRef,p.a],null,{bsValueChange:"bsValueChange"}),u["\u0275did"](37,16384,null,0,f.a,[d.a,h.a,u.Renderer2,u.ElementRef,u.ChangeDetectorRef],null,null),u["\u0275prd"](1024,null,r.NG_VALIDATORS,function(l,n){return[l,n]},[r.RequiredValidator,f.a]),u["\u0275prd"](1024,null,r.NG_VALUE_ACCESSOR,function(l,n){return[l,n]},[r.DefaultValueAccessor,f.a]),u["\u0275did"](40,671744,null,0,r.NgModel,[[2,r.ControlContainer],[6,r.NG_VALIDATORS],[8,null],[6,r.NG_VALUE_ACCESSOR]],{name:[0,"name"],model:[1,"model"]},null),u["\u0275prd"](2048,null,r.NgControl,null,[r.NgModel]),u["\u0275did"](42,16384,null,0,r.NgControlStatus,[[4,r.NgControl]],null,null),(l()(),u["\u0275eld"](43,0,null,null,2,"span",[["class","input-group-btn"]],null,null,null,null,null)),(l()(),u["\u0275eld"](44,0,null,null,1,"button",[["class","btn btn-default"],["type","button"]],null,[[null,"click"]],function(l,n,e){var t=!0;return"click"===n&&(t=0!=(u["\u0275nov"](l,33).isOpen=!0)&&t),t},null,null)),(l()(),u["\u0275eld"](45,0,null,null,0,"i",[["class","glyphicon glyphicon-calendar"]],null,null,null,null,null)),(l()(),u["\u0275eld"](46,0,null,null,11,"div",[["class","form-group col-xs-1"]],null,null,null,null,null)),(l()(),u["\u0275eld"](47,0,null,null,10,"div",[["class","row"]],null,null,null,null,null)),(l()(),u["\u0275eld"](48,0,null,null,1,"label",[["class","d-block"]],null,null,null,null,null)),(l()(),u["\u0275ted"](-1,null,["Search By"])),(l()(),u["\u0275eld"](50,0,null,null,7,"sh-select",[["name","searchBy"],["placeholder","--Select--"]],[[2,"ng-untouched",null],[2,"ng-touched",null],[2,"ng-pristine",null],[2,"ng-dirty",null],[2,"ng-valid",null],[2,"ng-invalid",null],[2,"ng-pending",null]],[[null,"ngModelChange"],["window","mouseup"]],function(l,n,e){var t=!0,o=l.component;return"window:mouseup"===n&&(t=!1!==u["\u0275nov"](l,51).onDocumentClick(e)&&t),"ngModelChange"===n&&(t=!1!==(o.mfStockSearchRequest.searchBy=e)&&t),t},s.b,s.a)),u["\u0275did"](51,4833280,null,2,c.a,[u.ElementRef,u.Renderer,u.ChangeDetectorRef],{placeholder:[0,"placeholder"],ItemHeight:[1,"ItemHeight"],options:[2,"options"]},null),u["\u0275qud"](335544320,3,{notFoundLinkTemplate:0}),u["\u0275qud"](335544320,4,{optionTemplate:0}),u["\u0275prd"](1024,null,r.NG_VALUE_ACCESSOR,function(l){return[l]},[c.a]),u["\u0275did"](55,671744,null,0,r.NgModel,[[2,r.ControlContainer],[8,null],[8,null],[6,r.NG_VALUE_ACCESSOR]],{name:[0,"name"],model:[1,"model"]},{update:"ngModelChange"}),u["\u0275prd"](2048,null,r.NgControl,null,[r.NgModel]),u["\u0275did"](57,16384,null,0,r.NgControlStatus,[[4,r.NgControl]],null,null),(l()(),u["\u0275eld"](58,0,null,null,11,"div",[["class","form-group col-xs-2"]],null,null,null,null,null)),(l()(),u["\u0275eld"](59,0,null,null,10,"div",[["class",""]],null,null,null,null,null)),(l()(),u["\u0275eld"](60,0,null,null,1,"label",[["class","d-block"]],null,null,null,null,null)),(l()(),u["\u0275ted"](-1,null,["Operation"])),(l()(),u["\u0275eld"](62,0,null,null,7,"sh-select",[["name","searchOperation"],["placeholder","--Select--"]],[[2,"ng-untouched",null],[2,"ng-touched",null],[2,"ng-pristine",null],[2,"ng-dirty",null],[2,"ng-valid",null],[2,"ng-invalid",null],[2,"ng-pending",null]],[[null,"ngModelChange"],["window","mouseup"]],function(l,n,e){var t=!0,o=l.component;return"window:mouseup"===n&&(t=!1!==u["\u0275nov"](l,63).onDocumentClick(e)&&t),"ngModelChange"===n&&(t=!1!==(o.mfStockSearchRequest.searchOperation=e)&&t),t},s.b,s.a)),u["\u0275did"](63,4833280,null,2,c.a,[u.ElementRef,u.Renderer,u.ChangeDetectorRef],{placeholder:[0,"placeholder"],ItemHeight:[1,"ItemHeight"],options:[2,"options"]},null),u["\u0275qud"](335544320,5,{notFoundLinkTemplate:0}),u["\u0275qud"](335544320,6,{optionTemplate:0}),u["\u0275prd"](1024,null,r.NG_VALUE_ACCESSOR,function(l){return[l]},[c.a]),u["\u0275did"](67,671744,null,0,r.NgModel,[[2,r.ControlContainer],[8,null],[8,null],[6,r.NG_VALUE_ACCESSOR]],{name:[0,"name"],model:[1,"model"]},{update:"ngModelChange"}),u["\u0275prd"](2048,null,r.NgControl,null,[r.NgModel]),u["\u0275did"](69,16384,null,0,r.NgControlStatus,[[4,r.NgControl]],null,null),(l()(),u["\u0275eld"](70,0,null,null,10,"div",[["class","form-group col-xs-1"]],null,null,null,null,null)),(l()(),u["\u0275eld"](71,0,null,null,9,"div",[["class","row"]],null,null,null,null,null)),(l()(),u["\u0275eld"](72,0,null,null,1,"label",[["class","d-block"]],null,null,null,null,null)),(l()(),u["\u0275ted"](-1,null,["Value"])),(l()(),u["\u0275eld"](74,0,null,null,6,"input",[["class","form-control"],["decimalDigitsDirective",""],["name","searchValue"],["placeholder","Value"],["type","text"]],[[2,"ng-untouched",null],[2,"ng-touched",null],[2,"ng-pristine",null],[2,"ng-dirty",null],[2,"ng-valid",null],[2,"ng-invalid",null],[2,"ng-pending",null]],[[null,"ngModelChange"],[null,"input"],[null,"blur"],[null,"compositionstart"],[null,"compositionend"],[null,"keydown"],[null,"keypress"],[null,"paste"],[null,"drop"]],function(l,n,e){var t=!0,o=l.component;return"input"===n&&(t=!1!==u["\u0275nov"](l,75)._handleInput(e.target.value)&&t),"blur"===n&&(t=!1!==u["\u0275nov"](l,75).onTouched()&&t),"compositionstart"===n&&(t=!1!==u["\u0275nov"](l,75)._compositionStart()&&t),"compositionend"===n&&(t=!1!==u["\u0275nov"](l,75)._compositionEnd(e.target.value)&&t),"keydown"===n&&(t=!1!==u["\u0275nov"](l,80).onKeyDown(e)&&t),"keypress"===n&&(t=!1!==u["\u0275nov"](l,80).onKeyPress(e)&&t),"paste"===n&&(t=!1!==u["\u0275nov"](l,80).onPaste(e)&&t),"drop"===n&&(t=!1!==u["\u0275nov"](l,80).onDrop(e)&&t),"ngModelChange"===n&&(t=!1!==(o.mfStockSearchRequest.searchValue=e)&&t),t},null,null)),u["\u0275did"](75,16384,null,0,r.DefaultValueAccessor,[u.Renderer2,u.ElementRef,[2,r.COMPOSITION_BUFFER_MODE]],null,null),u["\u0275prd"](1024,null,r.NG_VALUE_ACCESSOR,function(l){return[l]},[r.DefaultValueAccessor]),u["\u0275did"](77,671744,null,0,r.NgModel,[[2,r.ControlContainer],[8,null],[8,null],[6,r.NG_VALUE_ACCESSOR]],{name:[0,"name"],model:[1,"model"]},{update:"ngModelChange"}),u["\u0275prd"](2048,null,r.NgControl,null,[r.NgModel]),u["\u0275did"](79,16384,null,0,r.NgControlStatus,[[4,r.NgControl]],null,null),u["\u0275did"](80,147456,null,0,m.a,[u.ElementRef,v.m],{DecimalPlaces:[0,"DecimalPlaces"]},null),(l()(),u["\u0275eld"](81,0,null,null,4,"div",[["class","form-group pull-left mrL2"]],null,null,null,null,null)),(l()(),u["\u0275eld"](82,0,null,null,1,"label",[["class","d-block"]],null,null,null,null,null)),(l()(),u["\u0275ted"](-1,null,["\xa0"])),(l()(),u["\u0275eld"](84,0,null,null,1,"button",[["class","btn btn-success"],["type","submit"]],null,null,null,null,null)),(l()(),u["\u0275ted"](-1,null,["Go"])),(l()(),u["\u0275and"](16777216,null,null,2,null,y)),u["\u0275did"](87,16384,null,0,t.NgIf,[u.ViewContainerRef,u.TemplateRef],{ngIf:[0,"ngIf"]},null),u["\u0275pid"](131072,t.AsyncPipe,[u.ChangeDetectorRef]),(l()(),u["\u0275and"](16777216,null,null,2,null,N)),u["\u0275did"](90,16384,null,0,t.NgIf,[u.ViewContainerRef,u.TemplateRef],{ngIf:[0,"ngIf"]},null),u["\u0275pid"](131072,t.AsyncPipe,[u.ChangeDetectorRef]),(l()(),u["\u0275and"](16777216,null,null,2,null,q)),u["\u0275did"](93,16384,null,0,t.NgIf,[u.ViewContainerRef,u.TemplateRef],{ngIf:[0,"ngIf"]},null),u["\u0275pid"](131072,t.AsyncPipe,[u.ChangeDetectorRef])],function(l,n){var e=n.component;l(n,20,0,""),l(n,22,0,"--Select Product--",33,e.stockListDropDown),l(n,26,0,"product",e.mfStockSearchRequest.product),l(n,35,0,""),l(n,36,0),l(n,40,0,"dateRange",e.mfStockSearchRequest.dateRange),l(n,51,0,"--Select--",33,e.filtersForSearchBy),l(n,55,0,"searchBy",e.mfStockSearchRequest.searchBy),l(n,63,0,"--Select--",33,e.filtersForSearchOperation),l(n,67,0,"searchOperation",e.mfStockSearchRequest.searchOperation),l(n,77,0,"searchValue",e.mfStockSearchRequest.searchValue),l(n,80,0,4),l(n,87,0,u["\u0275unv"](n,87,0,u["\u0275nov"](n,88).transform(e.isReportLoading$))),l(n,90,0,!u["\u0275unv"](n,90,0,u["\u0275nov"](n,91).transform(e.isReportLoading$))&&e.reportData&&0===e.reportData.results.length),l(n,93,0,!u["\u0275unv"](n,93,0,u["\u0275nov"](n,94).transform(e.isReportLoading$))&&e.reportData&&e.reportData.results.length>0)},function(l,n){l(n,9,0,u["\u0275nov"](n,13).ngClassUntouched,u["\u0275nov"](n,13).ngClassTouched,u["\u0275nov"](n,13).ngClassPristine,u["\u0275nov"](n,13).ngClassDirty,u["\u0275nov"](n,13).ngClassValid,u["\u0275nov"](n,13).ngClassInvalid,u["\u0275nov"](n,13).ngClassPending),l(n,19,0,u["\u0275nov"](n,20).required?"":null,u["\u0275nov"](n,28).ngClassUntouched,u["\u0275nov"](n,28).ngClassTouched,u["\u0275nov"](n,28).ngClassPristine,u["\u0275nov"](n,28).ngClassDirty,u["\u0275nov"](n,28).ngClassValid,u["\u0275nov"](n,28).ngClassInvalid,u["\u0275nov"](n,28).ngClassPending),l(n,33,0,u["\u0275nov"](n,35).required?"":null,u["\u0275nov"](n,42).ngClassUntouched,u["\u0275nov"](n,42).ngClassTouched,u["\u0275nov"](n,42).ngClassPristine,u["\u0275nov"](n,42).ngClassDirty,u["\u0275nov"](n,42).ngClassValid,u["\u0275nov"](n,42).ngClassInvalid,u["\u0275nov"](n,42).ngClassPending),l(n,50,0,u["\u0275nov"](n,57).ngClassUntouched,u["\u0275nov"](n,57).ngClassTouched,u["\u0275nov"](n,57).ngClassPristine,u["\u0275nov"](n,57).ngClassDirty,u["\u0275nov"](n,57).ngClassValid,u["\u0275nov"](n,57).ngClassInvalid,u["\u0275nov"](n,57).ngClassPending),l(n,62,0,u["\u0275nov"](n,69).ngClassUntouched,u["\u0275nov"](n,69).ngClassTouched,u["\u0275nov"](n,69).ngClassPristine,u["\u0275nov"](n,69).ngClassDirty,u["\u0275nov"](n,69).ngClassValid,u["\u0275nov"](n,69).ngClassInvalid,u["\u0275nov"](n,69).ngClassPending),l(n,74,0,u["\u0275nov"](n,79).ngClassUntouched,u["\u0275nov"](n,79).ngClassTouched,u["\u0275nov"](n,79).ngClassPristine,u["\u0275nov"](n,79).ngClassDirty,u["\u0275nov"](n,79).ngClassValid,u["\u0275nov"](n,79).ngClassInvalid,u["\u0275nov"](n,79).ngClassPending)})}function w(l){return u["\u0275vid"](0,[(l()(),u["\u0275eld"](0,0,null,null,1,"manufacturing-report",[],null,null,null,P,k)),u["\u0275did"](1,245760,null,0,C.a,[v.m,S.a,R.a,b.p],null,null)],function(l,n){l(n,1,0)},null)}var I=u["\u0275ccf"]("manufacturing-report",C.a,w,{},{},[])},r67W:function(l,n,e){"use strict";e.d(n,"b",function(){return r}),e.d(n,"c",function(){return f}),e.d(n,"a",function(){return m});var u=e("LoAr"),t=e("WT9V"),o=e("IfiR"),a=e("q37T"),i=e("VCDu"),r=u["\u0275crt"]({encapsulation:2,styles:[],data:{}});function s(l){return u["\u0275vid"](0,[(l()(),u["\u0275eld"](0,0,null,null,1,"li",[["class","pagination-first page-item"]],[[2,"disabled",null]],null,null,null,null)),(l()(),u["\u0275eld"](1,0,null,null,0,"a",[["class","page-link"],["href",""]],[[8,"innerHTML",1]],[[null,"click"]],function(l,n,e){var u=!0;return"click"===n&&(u=!1!==l.component.selectPage(1,e)&&u),u},null,null))],null,function(l,n){var e=n.component;l(n,0,0,e.noPrevious()||e.disabled),l(n,1,0,e.getText("first"))})}function c(l){return u["\u0275vid"](0,[(l()(),u["\u0275eld"](0,0,null,null,1,"li",[["class","pagination-prev page-item"]],[[2,"disabled",null]],null,null,null,null)),(l()(),u["\u0275eld"](1,0,null,null,0,"a",[["class","page-link"],["href",""]],[[8,"innerHTML",1]],[[null,"click"]],function(l,n,e){var u=!0,t=l.component;return"click"===n&&(u=!1!==t.selectPage(t.page-1,e)&&u),u},null,null))],null,function(l,n){var e=n.component;l(n,0,0,e.noPrevious()||e.disabled),l(n,1,0,e.getText("previous"))})}function d(l){return u["\u0275vid"](0,[(l()(),u["\u0275eld"](0,0,null,null,1,"li",[["class","pagination-page page-item"]],[[2,"active",null],[2,"disabled",null]],null,null,null,null)),(l()(),u["\u0275eld"](1,0,null,null,0,"a",[["class","page-link"],["href",""]],[[8,"innerHTML",1]],[[null,"click"]],function(l,n,e){var u=!0;return"click"===n&&(u=!1!==l.component.selectPage(l.context.$implicit.number,e)&&u),u},null,null))],null,function(l,n){l(n,0,0,n.context.$implicit.active,n.component.disabled&&!n.context.$implicit.active),l(n,1,0,n.context.$implicit.text)})}function g(l){return u["\u0275vid"](0,[(l()(),u["\u0275eld"](0,0,null,null,1,"li",[["class","pagination-next page-item"]],[[2,"disabled",null]],null,null,null,null)),(l()(),u["\u0275eld"](1,0,null,null,0,"a",[["class","page-link"],["href",""]],[[8,"innerHTML",1]],[[null,"click"]],function(l,n,e){var u=!0,t=l.component;return"click"===n&&(u=!1!==t.selectPage(t.page+1,e)&&u),u},null,null))],null,function(l,n){var e=n.component;l(n,0,0,e.noNext()||e.disabled),l(n,1,0,e.getText("next"))})}function p(l){return u["\u0275vid"](0,[(l()(),u["\u0275eld"](0,0,null,null,1,"li",[["class","pagination-last page-item"]],[[2,"disabled",null]],null,null,null,null)),(l()(),u["\u0275eld"](1,0,null,null,0,"a",[["class","page-link"],["href",""]],[[8,"innerHTML",1]],[[null,"click"]],function(l,n,e){var u=!0,t=l.component;return"click"===n&&(u=!1!==t.selectPage(t.totalPages,e)&&u),u},null,null))],null,function(l,n){var e=n.component;l(n,0,0,e.noNext()||e.disabled),l(n,1,0,e.getText("last"))})}function f(l){return u["\u0275vid"](0,[(l()(),u["\u0275eld"](0,0,null,null,11,"ul",[["class","pagination"]],null,null,null,null,null)),u["\u0275did"](1,278528,null,0,t.NgClass,[u.IterableDiffers,u.KeyValueDiffers,u.ElementRef,u.Renderer2],{klass:[0,"klass"],ngClass:[1,"ngClass"]},null),(l()(),u["\u0275and"](16777216,null,null,1,null,s)),u["\u0275did"](3,16384,null,0,t.NgIf,[u.ViewContainerRef,u.TemplateRef],{ngIf:[0,"ngIf"]},null),(l()(),u["\u0275and"](16777216,null,null,1,null,c)),u["\u0275did"](5,16384,null,0,t.NgIf,[u.ViewContainerRef,u.TemplateRef],{ngIf:[0,"ngIf"]},null),(l()(),u["\u0275and"](16777216,null,null,1,null,d)),u["\u0275did"](7,278528,null,0,t.NgForOf,[u.ViewContainerRef,u.TemplateRef,u.IterableDiffers],{ngForOf:[0,"ngForOf"]},null),(l()(),u["\u0275and"](16777216,null,null,1,null,g)),u["\u0275did"](9,16384,null,0,t.NgIf,[u.ViewContainerRef,u.TemplateRef],{ngIf:[0,"ngIf"]},null),(l()(),u["\u0275and"](16777216,null,null,1,null,p)),u["\u0275did"](11,16384,null,0,t.NgIf,[u.ViewContainerRef,u.TemplateRef],{ngIf:[0,"ngIf"]},null)],function(l,n){var e=n.component;l(n,1,0,"pagination",e.classMap),l(n,3,0,e.boundaryLinks),l(n,5,0,e.directionLinks),l(n,7,0,e.pages),l(n,9,0,e.directionLinks),l(n,11,0,e.boundaryLinks)},null)}function h(l){return u["\u0275vid"](0,[(l()(),u["\u0275eld"](0,0,null,null,2,"pagination",[],null,null,null,f,r)),u["\u0275prd"](5120,null,o.NG_VALUE_ACCESSOR,function(l){return[l]},[a.a]),u["\u0275did"](2,114688,null,0,a.a,[u.Renderer2,u.ElementRef,i.a,u.ChangeDetectorRef],null,null)],function(l,n){l(n,2,0)},null)}var m=u["\u0275ccf"]("pagination",a.a,h,{align:"align",maxSize:"maxSize",boundaryLinks:"boundaryLinks",directionLinks:"directionLinks",firstText:"firstText",previousText:"previousText",nextText:"nextText",lastText:"lastText",rotate:"rotate",pageBtnClass:"pageBtnClass",disabled:"disabled",itemsPerPage:"itemsPerPage",totalItems:"totalItems"},{numPages:"numPages",pageChanged:"pageChanged"},[])}}]);