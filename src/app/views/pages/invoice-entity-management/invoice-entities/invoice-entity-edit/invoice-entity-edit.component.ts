// Angular
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, ViewChild, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
// Material
import { MatDialog, MatSelect, DateAdapter, MAT_DATE_FORMATS, MatTabChangeEvent } from '@angular/material';
// RxJS
import { Observable, BehaviorSubject, Subscription, of, ReplaySubject, Subject } from 'rxjs';
import { map, startWith, delay, first, takeUntil } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../../core/reducers';
// Layout
import { SubheaderService, LayoutConfigService } from '../../../../../core/_base/layout';
// CRUD
import { LayoutUtilsService, TypesUtilsService, MessageType } from '../../../../../core/_base/crud';
// Services and Models
import {
	selectLastCreatedInvoiceEntityId,
	selectInvoiceEntityById,
	InvoiceEntityModel,
	InvoiceEntityOnServerCreated,
	InvoiceEntityUpdated,
	InvoiceEntitiesService,
	StaticDataModel,

	StaticDataService,
	FilterModel,
	ApiResponse,

	AppDateAdapter,
	APP_DATE_FORMATS,

	MedelitStaticData
} from '../../../../../core/medelit';
import { NgxSpinnerService } from 'ngx-spinner';
import { MedelitConstants } from '../../../../../core/_base/constants/medelit-contstants';
import { MedelitBaseComponent } from '../../../../../core/_base/components/medelit-base.component';


@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-invoiceEntity-edit',
	templateUrl: './invoice-entity-edit.component.html',
	styleUrls: ['./invoice-entity-edit.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoiceEntityEditComponent extends MedelitBaseComponent implements OnInit, OnDestroy {
	// Public properties

	invoiceEntity: InvoiceEntityModel;
	invoiceEntityId$: Observable<number>;
	titles: Observable<StaticDataModel>;
	languages: Observable<StaticDataModel>;
	countries: Observable<StaticDataModel>;
	cities: Observable<StaticDataModel>;
	relationaships: Observable<StaticDataModel>;
	services: Observable<StaticDataModel>;
	oldInvoiceEntity: InvoiceEntityModel;
	selectedTab = 0;
	tabTitle: string = '';
	loadingSubject = new BehaviorSubject<boolean>(true);
	loading$: Observable<boolean>;
	invoiceEntityForm: FormGroup;
	hasFormErrors = false;
	availableYears: number[] = [];
	filteredColors: Observable<string[]>;
	filteredManufactures: Observable<string[]>;
	// Private password
	private componentSubscriptions: Subscription;
	// sticky portlet header margin
	private headerMargin: number;
	selected = new FormControl(0);


	languagesForFilter: FilterModel[] = [];
	filteredLanguages: Observable<FilterModel[]>;

	countriesForCountryOfBirthForFilter: FilterModel[] = [];
	filteredCountriesOfBirth: Observable<FilterModel[]>;
	filteredBillingCountries: Observable<FilterModel[]>;
	filteredMailingCountries: Observable<FilterModel[]>;

	servicesForFilter: FilterModel[] = [];
	filteredServices: Observable<FilterModel[]>;

	professionalsForFilter: FilterModel[] = [];
	filteredProfessionals: Observable<FilterModel[]>;

	paymentMethodOptions: FilterModel[];
	ratingOptions: FilterModel[];
	relationshipsForFilter: FilterModel[];
	paymentMethodsOptions: FilterModel[];
	paymentStatusOptions: FilterModel[];
	discountNetworkOptions: FilterModel[];
	ieTypeOptions: FilterModel[];
	listedDiscountNetworkOptions: FilterModel[];
	buildingTypeOptions: FilterModel[];
	visitVenueOptions: FilterModel[];
	invoiceEntityStatusOptions: FilterModel[];
	invoiceEntitySourceOptions: FilterModel[];
	contactMethodOptions: FilterModel[];
	invoiceEntityCategoryOptions: FilterModel[];
	proAccountOptions: FilterModel[];    // BE

	invoiceEntitiesForFilter: FilterModel[] = [];
	filteredInvoiceEntities: Observable<FilterModel[]>;

	citiesForFilter: FilterModel[] = [];
	filteredBillingCities: Observable<FilterModel[]>;
	filteredMailingCities: Observable<FilterModel[]>;

	countriesForFilter: FilterModel[] = [];
	filteredCountriesHome: Observable<FilterModel[]>;
	filteredCountriesVisit: Observable<FilterModel[]>;

	constructor(
		private store: Store<AppState>,
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private typesUtilsService: TypesUtilsService,
		private invoiceEntityFB: FormBuilder,
		public dialog: MatDialog,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private layoutConfigService: LayoutConfigService,
		private invoiceEntityService: InvoiceEntitiesService,
		private staticService: StaticDataService,
		private spinner: NgxSpinnerService,
		private cdr: ChangeDetectorRef) {
		super();
	}

	ngOnInit() {
		this.loading$ = this.loadingSubject.asObservable();
		this.loadingSubject.next(true);
		this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id && id > 0) {

				//this.store.pipe(
				//	select(selectInvoiceEntityById(id))
				//).subscribe(result => {
				//	if (!result) {
				//		this.loadInvoiceEntityFromService(id);
				//		return;
				//	}

				//	this.loadInvoiceEntity(result);
				//});
				this.loadInvoiceEntityFromService(id);
			} else {
				const newInvoiceEntity = new InvoiceEntityModel();
				newInvoiceEntity.clear();
				this.loadInvoiceEntity(newInvoiceEntity);
			}
		});

		// sticky portlet header
		window.onload = () => {
			const style = getComputedStyle(document.getElementById('kt_header'));
			this.headerMargin = parseInt(style.height, 0);
		};
	}

	loadInvoiceEntity(_invoiceEntity, fromService: boolean = false) {
		if (!_invoiceEntity) {
			this.goBack('');
		}
		this.invoiceEntity = _invoiceEntity;
		this.invoiceEntityId$ = of(_invoiceEntity.id);
		this.oldInvoiceEntity = Object.assign({}, _invoiceEntity);
		this.initInvoiceEntity();
		this.detectChanges();
		this.loadStaticResources();
	}

	loadInvoiceEntityFromService(invoiceEntityId) {
		this.spinner.show();
		this.invoiceEntityService.getInvoiceEntityById(invoiceEntityId).toPromise().then(res => {
			this.loadingSubject.next(false);
			let data = res as unknown as ApiResponse;
			this.loadInvoiceEntity(data.data, true);

		}).catch((e) => {
			this.spinner.hide();
		}).finally(() => {
			this.spinner.hide();
		});
	}

	ngOnDestroy() {
		if (this.componentSubscriptions) {
			this.componentSubscriptions.unsubscribe();
		}
	}

	initInvoiceEntity() {
		this.createForm();
		this.loadingSubject.next(false);
		if (!this.invoiceEntity.id) {
			this.subheaderService.setBreadcrumbs([
				{ title: 'invoiceEntity-management', page: `/invoiceEntitys` },
				{ title: 'InvoiceEntitys', page: `/invoiceEntity-management/invoiceEntitys` },
				{ title: 'Create invoiceEntity', page: `/invoiceEntity-management/invoiceEntitys/add` }
			]);
			return;
		}
		this.subheaderService.setTitle('Invoice Entities');

		this.subheaderService.setBreadcrumbs([
			{ title: 'invoiceEntity-management', page: `/invoiceEntitys` },
			{ title: 'InvoiceEntitys', page: `/invoiceEntity-management/invoiceEntitys` },
			{ title: 'Edit invoiceEntity', page: `/invoiceEntity-management/invoiceEntitys/edit`, queryParams: { id: this.invoiceEntity.id } }
		]);

	}

	createForm() {
		this.invoiceEntityForm = this.invoiceEntityFB.group({
			name: [this.invoiceEntity.name, Validators.required],
			mainPhoneNumber: [this.invoiceEntity.mainPhoneNumber, [Validators.required, Validators.pattern(MedelitConstants.mobnumPattern)]],
			mainPhoneNumberOwner: [this.invoiceEntity.mainPhoneNumberOwner, Validators.required],
			phone2: [this.invoiceEntity.phone2, [Validators.pattern(MedelitConstants.mobnumPattern)]],
			phone2Owner: [this.invoiceEntity.phone2Owner, []],
			phone3: [this.invoiceEntity.phone3, [Validators.pattern(MedelitConstants.mobnumPattern)]],
			phone3Owner: [this.invoiceEntity.phone3Owner, []],
			email: [this.invoiceEntity.email, [Validators.required, Validators.email]],
			email2: [this.invoiceEntity.email2, [Validators.email]],
			ratingId: [this.invoiceEntity.ratingId, Validators.required],
			relationshipWithCustomerId: [this.invoiceEntity.relationshipWithCustomerId, []],
			ieTypeId: [this.invoiceEntity.ieTypeId, [Validators.required]],
			fax: [this.invoiceEntity.fax, []],
			dateOfBirth: [this.formatDate(this.invoiceEntity.dateOfBirth), []],
			countryOfBirthId: [this.invoiceEntity.countryOfBirthId, []],
			billingAddress: [this.invoiceEntity.billingAddress, [Validators.required]],
			mailingAddress: [this.invoiceEntity.mailingAddress, [Validators.required]],
			billingPostCode: [this.invoiceEntity.billingPostCode, []],
			mailingPostCode: [this.invoiceEntity.mailingPostCode, []],
			billingCity: [this.invoiceEntity.billingCity, [Validators.required]],
			mailingCity: [this.invoiceEntity.mailingCity, [Validators.required]],
			billingCountryId: [this.invoiceEntity.billingCountryId, [Validators.required]],
			mailingCountryId: [this.invoiceEntity.mailingCountryId, [Validators.required]],
			description: [this.invoiceEntity.description, []],
			vatNumber: [this.invoiceEntity.vatNumber, []],
			paymentMethodId: [this.invoiceEntity.paymentMethodId, [Validators.required]],

			bank: [this.invoiceEntity.bank, []],
			accountNumber: [this.invoiceEntity.accountNumber, []],
			sortCode: [this.invoiceEntity.sortCode, []],
			iban: [this.invoiceEntity.iban, []],

			insuranceCoverId: [this.invoiceEntity.insuranceCoverId, []],
			invoicingNotes: [this.invoiceEntity.invoicingNotes, []],
			discountNetworkId: [this.invoiceEntity.discountNetworkId, []],
			personOfReference: [this.invoiceEntity.personOfReference, []],
			personOfReferenceEmail: [this.invoiceEntity.personOfReferenceEmail, [Validators.required, Validators.email]],
			personOfReferencePhone: [this.invoiceEntity.personOfReferencePhone, []],
			blackListId: [this.invoiceEntity.blackListId, []],
			contractedId: [this.invoiceEntity.contractedId, []],
			discountPercent: [this.invoiceEntity.discountPercent, []],
		});
	}

	goBack(id) {
		this.loadingSubject.next(false);
		const url = `/invoice-entity-management/invoice-entities?id=${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	goBackWithoutId() {
		this.router.navigateByUrl('/invoice-entity-management/invoice-entities', { relativeTo: this.activatedRoute });
	}

	refreshInvoiceEntity(isNew: boolean = false, id = 0) {
		this.loadingSubject.next(false);
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/invoice-entity-management/invoice-entities/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	reset() {
		this.invoiceEntity = Object.assign({}, this.oldInvoiceEntity);
		this.createForm();
		this.hasFormErrors = false;
		this.invoiceEntityForm.markAsPristine();
		this.invoiceEntityForm.markAsUntouched();
		this.invoiceEntityForm.updateValueAndValidity();
	}

	onSumbit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.invoiceEntityForm.controls;
		/** check form */
		if (this.invoiceEntityForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			window.scroll(0, 0);
			return;
		}

		// tslint:disable-next-line:prefer-const
		let editedInvoiceEntity = this.prepareInvoiceEntity();

		if (editedInvoiceEntity.id > 0) {
			this.updateInvoiceEntity(editedInvoiceEntity, withBack);
			return;
		}

		this.addInvoiceEntity(editedInvoiceEntity, withBack);
	}

	prepareInvoiceEntity(): InvoiceEntityModel {
		const controls = this.invoiceEntityForm.controls;
		const _invoiceEntity = new InvoiceEntityModel();
		_invoiceEntity.id = this.invoiceEntity.id;
		_invoiceEntity.name = controls.name.value;
		_invoiceEntity.mainPhoneNumber = controls.mainPhoneNumber.value;
		_invoiceEntity.mainPhoneNumberOwner = controls.mainPhoneNumberOwner.value;
		_invoiceEntity.phone2 = controls.phone2.value;
		_invoiceEntity.phone2Owner = controls.phone2Owner.value;
		_invoiceEntity.phone3 = controls.phone3.value;
		_invoiceEntity.phone3Owner = controls.phone3Owner.value;
		_invoiceEntity.email = controls.email.value;
		_invoiceEntity.email2 = controls.email2.value;
		_invoiceEntity.ratingId = controls.ratingId.value;
		_invoiceEntity.relationshipWithCustomerId = controls.relationshipWithCustomerId.value;
		_invoiceEntity.ieTypeId = controls.ieTypeId.value;
		_invoiceEntity.fax = controls.fax.value;
		_invoiceEntity.dateOfBirth = this.toDateFormat(controls.dateOfBirth.value);
		if (controls.countryOfBirthId.value)
			_invoiceEntity.countryOfBirthId = controls.countryOfBirthId.value.id;
		_invoiceEntity.billingAddress = controls.billingAddress.value;
		_invoiceEntity.mailingAddress = controls.mailingAddress.value;
		_invoiceEntity.billingPostCode = controls.billingPostCode.value;
		_invoiceEntity.mailingPostCode = controls.mailingPostCode.value;
		_invoiceEntity.billingCity = controls.billingCity.value;
		_invoiceEntity.mailingCity = controls.mailingCity.value;

		if (controls.billingCountryId.value)
			_invoiceEntity.billingCountryId = controls.billingCountryId.value.id;
		if (controls.mailingCountryId.value)
			_invoiceEntity.mailingCountryId = controls.mailingCountryId.value.id;
		_invoiceEntity.description = controls.description.value;
		_invoiceEntity.vatNumber = controls.vatNumber.value;
		_invoiceEntity.paymentMethodId = controls.paymentMethodId.value;
		_invoiceEntity.bank = controls.bank.value;
		_invoiceEntity.accountNumber = controls.accountNumber.value;
		_invoiceEntity.sortCode = controls.sortCode.value;
		_invoiceEntity.iban = controls.iban.value;

		_invoiceEntity.insuranceCoverId = controls.insuranceCoverId.value;
		_invoiceEntity.invoicingNotes = controls.invoicingNotes.value;
		_invoiceEntity.discountNetworkId = controls.discountNetworkId.value;
		_invoiceEntity.personOfReference = controls.personOfReference.value;
		_invoiceEntity.personOfReferenceEmail = controls.personOfReferenceEmail.value;
		_invoiceEntity.personOfReferencePhone = controls.personOfReferencePhone.value;
		_invoiceEntity.blackListId = controls.blackListId.value;
		_invoiceEntity.contractedId = controls.contractedId.value;
		_invoiceEntity.discountPercent = controls.discountPercent.value;

		return _invoiceEntity;
	}

	addInvoiceEntity(_invoiceEntity: InvoiceEntityModel, withBack: boolean = false) {
		this.spinner.show();
		this.invoiceEntityService.createInvoiceEntity(_invoiceEntity).toPromise().then((res) => {
			this.spinner.hide();
			const resp = res as unknown as ApiResponse;
			if (resp.success && resp.data.id > 0) {
				const message = `New invoiceEntity successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 10000, true, true);
				this.refreshInvoiceEntity(true, resp.data.id);
			} else {
				const message = `An error occured while processing your request. Please try again later.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 10000, true, true);
			}
		}).catch((e) => {
			this.spinner.hide();
		});

		//this.store.dispatch(new InvoiceEntityOnServerCreated({ invoiceEntity: _invoiceEntity }));
		//this.componentSubscriptions = this.store.pipe(
		//	delay(1000),
		//	select(selectLastCreatedInvoiceEntityId)
		//).subscribe(newId => {
		//	if (!newId) {
		//		return;
		//	}

		//	this.loadingSubject.next(false);
		//	if (withBack) {
		//		this.goBack(newId);
		//	} else {
		//		const message = `New invoiceEntity successfully has been added.`;
		//		this.layoutUtilsService.showActionNotification(message, MessageType.Create, 10000, true, true);
		//		this.refreshInvoiceEntity(true, newId);
		//	}
		//});
	}

	updateInvoiceEntity(_invoiceEntity: InvoiceEntityModel, withBack: boolean = false) {
		this.spinner.show();
		this.invoiceEntityService.updateInvoiceEntity(_invoiceEntity).toPromise().then((res) => {
			this.spinner.hide();
			const resp = res as unknown as ApiResponse;
			if (resp.success && resp.data.id > 0) {
				const _invoiceEntity = resp.data as unknown as InvoiceEntityModel;
				this.loadInvoiceEntity(_invoiceEntity, true);

				const message = `InvoiceEntity successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 10000, true, true);
				this.refreshInvoiceEntity(false);
			} else {
				const message = `An error occured while processing your request. Please try again later.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 10000, true, true);
			}
		}).catch((e) => {
			this.spinner.hide();
		});

		//this.loadingSubject.next(true);
		//const updateInvoiceEntity: Update<InvoiceEntityModel> = {
		//	id: _invoiceEntity.id,
		//	changes: _invoiceEntity
		//};

		//this.store.dispatch(new InvoiceEntityUpdated({
		//	partialInvoiceEntity: updateInvoiceEntity,
		//	invoiceEntity: _invoiceEntity
		//}));

		//of(undefined).pipe(delay(3000)).subscribe(() => { // Remove this line
		//	if (withBack) {
		//		this.goBack(_invoiceEntity.id);
		//	} else {
		//		const message = `InvoiceEntity successfully has been saved.`;
		//		this.layoutUtilsService.showActionNotification(message, MessageType.Update, 10000, true, true);
		//		this.refreshInvoiceEntity(false);
		//	}
		//}); 
	}

	getComponentTitle() {

		let result = 'Create Invoice Entity';
		if (this.selectedTab == 0) {
			if (!this.invoiceEntity || !this.invoiceEntity.id) {
				return result;
			}
			result = `Edit customer - ${this.invoiceEntity.name}`;
		} else {
			result = this.tabTitle;
		}
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}


	/*Fitlers Section*/
	loadStaticResources() {
		this.loadCountriesFilter();

		this.staticService.getStaticDataForFitler().pipe(map(n => n.data as unknown as MedelitStaticData[])).toPromise().then((data) => {
			this.relationshipsForFilter = data.map((el) => { return { id: el.id, value: el.relationships }; }).filter((e) => { if (e.value && e.value.length > 0) return e; });

			if (this.invoiceEntity.relationshipWithCustomerId) {
				var obj = data.find((e) => { return e.id == this.invoiceEntity.relationshipWithCustomerId });
				if (obj)
					this.invoiceEntityForm.get('relationshipWithCustomerId').setValue(obj.id);
			}

			// payment methods
			this.paymentMethodOptions = data.map((el) => { return { id: el.id, value: el.paymentMethods }; }).filter((e) => { if (e.value && e.value.length > 0) return e; });

			if (this.invoiceEntity.paymentMethodId) {
				var obj = data.find((e) => { return e.id == this.invoiceEntity.paymentMethodId });
				if (obj)
					this.invoiceEntityForm.get('paymentMethodId').setValue(obj.id);
			}

			// rating options

			this.ratingOptions = data.map((el) => { return { id: el.id, value: el.ieRatings }; }).filter((e) => { if (e.value && e.value.length > 0) return e; });

			if (this.invoiceEntity.ratingId) {
				var obj = data.find((e) => { return e.id == this.invoiceEntity.ratingId });
				if (obj)
					this.invoiceEntityForm.get('ratingId').setValue(obj.id);
			}

			this.ieTypeOptions = data.map((el) => { return { id: el.id, value: el.ieTypes }; }).filter((e) => { if (e.value && e.value.length > 0) return e; });

			if (this.invoiceEntity.ieTypeId) {
				var obj = data.find((e) => { return e.id == this.invoiceEntity.ieTypeId });
				if (obj)
					this.invoiceEntityForm.get('ieTypeId').setValue(obj.id);
			}

			// discount networks
			this.discountNetworkOptions = data.map((el) => { return { id: el.id, value: el.discountNetworks }; }).filter((e) => { if (e.value && e.value.length > 0) return e; });

			if (this.invoiceEntity.discountNetworkId) {
				var obj = data.find((e) => { return e.id == this.invoiceEntity.discountNetworkId });
				if (obj)
					this.invoiceEntityForm.get('discountNetworkId').setValue(obj.id);
			}
		});


		if (this.invoiceEntity.insuranceCoverId) {
			this.invoiceEntityForm.get('insuranceCoverId').setValue(this.invoiceEntity.insuranceCoverId.toString());
		}

		if (this.invoiceEntity.blackListId !== undefined) {
			this.invoiceEntityForm.get('blackListId').setValue(this.invoiceEntity.blackListId.toString());
		}

		if (this.invoiceEntity.contractedId !== undefined) {
			this.invoiceEntityForm.get('contractedId').setValue(this.invoiceEntity.contractedId.toString());
		}
	}


	//// Country of Birth
	loadCountriesFilter() {
		this.staticService.getCountriesForFilter().subscribe(res => {
			this.countriesForCountryOfBirthForFilter = res.data;

			this.filteredCountriesOfBirth = this.invoiceEntityForm.get('countryOfBirthId').valueChanges
				.pipe(
					startWith(''),
					map(value => this.filteredCountryOfBirth(value))
				);
			if (this.invoiceEntity.countryOfBirthId > 0) {
				var title = this.countriesForCountryOfBirthForFilter.find(x => x.id == this.invoiceEntity.countryOfBirthId);
				if (title) {
					this.invoiceEntityForm.patchValue({ 'countryOfBirthId': { id: title.id, value: title.value } });
				}
			}


			this.filteredBillingCountries = this.invoiceEntityForm.get('billingCountryId').valueChanges
				.pipe(
					startWith(''),
					map(value => this.filteredCountryOfBirth(value))
				);
			if (this.invoiceEntity.billingCountryId > 0) {
				var title = this.countriesForCountryOfBirthForFilter.find(x => x.id == this.invoiceEntity.billingCountryId);
				if (title) {
					this.invoiceEntityForm.patchValue({ 'billingCountryId': { id: title.id, value: title.value } });
				}
			}

			this.filteredMailingCountries = this.invoiceEntityForm.get('mailingCountryId').valueChanges
				.pipe(
					startWith(''),
					map(value => this.filteredCountryOfBirth(value))
				);
			if (this.invoiceEntity.mailingCountryId > 0) {
				var title = this.countriesForCountryOfBirthForFilter.find(x => x.id == this.invoiceEntity.mailingCountryId);
				if (title) {
					this.invoiceEntityForm.patchValue({ 'mailingCountryId': { id: title.id, value: title.value } });
				}
			}

		});

	}

	private filteredCountryOfBirth(value: string): FilterModel[] {
		const filterValue = this._normalizeValue(value);
		return this.countriesForCountryOfBirthForFilter.filter(title => this._normalizeValue(title.value).includes(filterValue));
	}
	// end Country of Birth

	displayFn(option: FilterModel): string {
		if (option)
			return option.value;
		return '';
	}

	private _normalizeValue(value: string): string {
		if (value && value.length > 0)
			return value.toLowerCase().replace(/\s/g, '');
		return value;
	}

	/*End Filters Section*/

	/*Start closed events */

	controlFocusout(control) {
		const val = this.invoiceEntityForm.get(control).value;
		if (val && val.id) return;
		this.invoiceEntityForm.get(control).setValue('');
		this.cdr.markForCheck();
	}

	/*End Closed events */



	tabChanged(event: MatTabChangeEvent) {
		this.tabTitle = event.tab.textLabel;
	}

	detectChanges() {
		try {
			this.cdr.detectChanges();
		} catch {

		}
	}
}
