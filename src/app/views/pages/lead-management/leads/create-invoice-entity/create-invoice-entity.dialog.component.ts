// Angular
import { Component, OnInit, Inject, ChangeDetectionStrategy, ViewEncapsulation, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
// Material
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
// RxJS
import { Subscription, of, Observable, BehaviorSubject } from 'rxjs';
import { delay, map, startWith } from 'rxjs/operators';
// NGRX
import { Update } from '@ngrx/entity';
import { Store, select } from '@ngrx/store';
// State
import { AppState } from '../../../../../core/reducers';
// CRUD
import { TypesUtilsService, MessageType, LayoutUtilsService } from '../../../../../core/_base/crud';
import { InvoiceEntityModel, selectInvoiceEntitiesActionLoading, InvoiceEntityUpdated, InvoiceEntityOnServerCreated, selectLastCreatedInvoiceEntityId, FilterModel, StaticDataModel, StaticDataService, InvoiceEntitiesService, ApiResponse } from '../../../../../core/medelit';
import { NgxSpinnerService } from 'ngx-spinner';


@Component({
	// tslint:disable-next-line:component-selector
	selector: 'create-invoice-entity-dialog',
	templateUrl: './create-invoice-entity.dialog.component.html',
	styleUrls: ['./create-invoice-entity.dialog.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class CreateInvoiceEntityDialogComponent implements OnInit, OnDestroy {
	// Public properties
	viewLoading: boolean;
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

	constructor(public dialogRef: MatDialogRef<CreateInvoiceEntityDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private store: Store<AppState>,
		private staticService: StaticDataService,
		private ieService: InvoiceEntitiesService,
		private spinner: NgxSpinnerService,
		private layoutUtils: LayoutUtilsService,
		private typesUtilsService: TypesUtilsService) {
	}

	ngOnInit() {
		this.invoiceEntity = this.data;
		this.createForm();
		this.loadStaticResources();
	}

	ngOnDestroy() {
		if (this.componentSubscriptions) {
			this.componentSubscriptions.unsubscribe();
		}
	}

	createForm() {

		this.invoiceEntityForm = this.fb.group({
			name: [this.invoiceEntity.name, Validators.required],
			mainPhoneNumber: [this.invoiceEntity.mainPhoneNumber, Validators.required],
			mainPhoneNumberOwner: [this.invoiceEntity.mainPhoneNumberOwner, Validators.required],
			phone2: [this.invoiceEntity.phone2, []],
			phone2Owner: [this.invoiceEntity.phone2Owner, []],
			phone3: [this.invoiceEntity.phone3, []],
			phone3Owner: [this.invoiceEntity.phone3Owner, []],
			email: [this.invoiceEntity.email, [Validators.required, Validators.email]],
			email2: [this.invoiceEntity.email2, [Validators.email]],
			ratingId: [this.invoiceEntity.ratingId, Validators.required],
			relationshipWithCustomerId: [this.invoiceEntity.relationshipWithCustomerId, []],
			ieTypeId: [this.invoiceEntity.ieTypeId, [Validators.required]],
			fax: [this.invoiceEntity.fax, []],
			dateOfBirth: [this.invoiceEntity.dateOfBirth, [Validators.required]],
			countryOfBirthId: [this.invoiceEntity.countryOfBirthId, [Validators.required]],
			billingAddress: [this.invoiceEntity.billingAddress, [Validators.required]],
			mailingAddress: [this.invoiceEntity.mailingAddress, [Validators.required]],
			billingPostCode: [this.invoiceEntity.billingPostCode, []],
			mailingPostCode: [this.invoiceEntity.mailingPostCode, []],
			billingCityId: [this.invoiceEntity.billingCityId, [Validators.required]],
			mailingCityId: [this.invoiceEntity.mailingCityId, [Validators.required]],
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
			discountPercent: [this.invoiceEntity.discountPercent, []],

		});
	}

	/**
	 * Returns page title
	 */
	getTitle(): string {
		//if (this.invoiceEntity.id > 0) {
		//	return `Edit Invoice Entity '${this.invoiceEntity.id} ${this.invoiceEntity.name}'`;
		//}

		return 'New Invoice Entity';
	}

	/**
	 * Check control is invalid
	 * @param controlName: string
	 */
	isControlInvalid(controlName: string): boolean {
		const control = this.invoiceEntityForm.controls[controlName];
		const result = control.invalid && control.touched;
		return result;
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
		_invoiceEntity.dateOfBirth = controls.dateOfBirth.value;
		if (controls.countryOfBirthId.value)
			_invoiceEntity.countryOfBirthId = controls.countryOfBirthId.value.id;
		_invoiceEntity.billingAddress = controls.billingAddress.value;
		_invoiceEntity.mailingAddress = controls.mailingAddress.value;
		_invoiceEntity.billingPostCode = controls.billingPostCode.value;
		_invoiceEntity.mailingPostCode = controls.mailingPostCode.value;
		if (controls.billingCityId.value)
			_invoiceEntity.billingCityId = controls.billingCityId.value.id;
		if (controls.mailingCityId.value)
			_invoiceEntity.mailingCityId = controls.mailingCityId.value.id;

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
		_invoiceEntity.discountPercent = controls.discountPercent.value;


		return _invoiceEntity;
	}

	onSubmit() {
		this.hasFormErrors = false;
		const controls = this.invoiceEntityForm.controls;

		if (this.invoiceEntityForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			return;
		}

		const editedInvoiceEntity = this.prepareInvoiceEntity();
		if (editedInvoiceEntity.id > 0) {
			this.updateInvoiceEntity(editedInvoiceEntity);
		} else {
			this.createInvoiceEntity(editedInvoiceEntity);
		}
	}

	/**
	 * Update invoiceEntity
	 *
	 * @param _invoiceEntity: InvoiceEntityModel
	 */
	updateInvoiceEntity(_invoiceEntity: InvoiceEntityModel) {
		const updateInvoiceEntity: Update<InvoiceEntityModel> = {
			id: _invoiceEntity.id,
			changes: _invoiceEntity
		};
		this.store.dispatch(new InvoiceEntityUpdated({
			partialEntity: updateInvoiceEntity,
			entity: _invoiceEntity
		}));

		// Remove this line
		of(undefined).pipe(delay(5000)).subscribe(() => this.dialogRef.close({ _invoiceEntity, isEdit: true }));
		// Uncomment this line
		// this.dialogRef.close({ _invoiceEntity, isEdit: true }
	}

	/**
	 * Create invoiceEntity
	 *
	 * @param _invoiceEntity: InvoiceEntityModel
	 */
	createInvoiceEntity(_invoiceEntity: InvoiceEntityModel) {
		this.spinner.show();
		this.ieService.createInvoiceEntity(_invoiceEntity).toPromise().then((res) => {
			this.spinner.hide();
			var resp = res as unknown as ApiResponse;
			if (resp.success && resp.data.id > 0) {
				this.dialogRef.close({ resp, isEdit: false });
			} else {
				const message = `An error occured while processing your request. Please try again later.`;
				this.layoutUtils.showActionNotification(message, MessageType.Create, 10000, true, true);
			}
		}).catch((err) => {
			this.spinner.hide();
			console.log(err);
			const message = `An error occured while processing your request. Please try again later.`;
			this.layoutUtils.showActionNotification(message, MessageType.Create, 10000, true, true);
		});




		//this.store.dispatch(new InvoiceEntityOnServerCreated({ entity: _invoiceEntity }));
		//this.componentSubscriptions = this.store.pipe(
		//	select(selectLastCreatedInvoiceEntityId),
		//	delay(2000), // Remove this line
		//).subscribe(res => {
		//	//if (!res) {
		//	//	return;
		//	//}

		//	this.dialogRef.close({ _invoiceEntity, isEdit: false });
		//});
	}

	/** Alect Close event */
	onAlertClose($event) {
		this.hasFormErrors = false;
	}

	/*Fitlers Section*/
	loadStaticResources() {
		this.loadCountriesFilter();
		this.loadCitiesForFilter();

		this.staticService.getRelationshipsForFilter().pipe(map(n => n.data as unknown as FilterModel[])).toPromise().then((data) => {
			this.relationshipsForFilter = data;

			if (this.invoiceEntity.relationshipWithCustomerId) {
				var obj = data.find((e) => { return e.id == this.invoiceEntity.relationshipWithCustomerId });
				if (obj)
					this.invoiceEntityForm.get('relationshipWithCustomerId').setValue(obj.id);
			}
		});

		this.staticService.getPaymentMethodsForFilter().pipe(map(n => n.data as unknown as FilterModel[])).toPromise().then((data) => {
			this.paymentMethodOptions = data;

			if (this.invoiceEntity.paymentMethodId) {
				var obj = data.find((e) => { return e.id == this.invoiceEntity.paymentMethodId });
				if (obj)
					this.invoiceEntityForm.get('paymentMethodId').setValue(obj.id);
			}
		});

		this.staticService.getRatingOptions().pipe(map(n => n.data as unknown as FilterModel[])).toPromise().then((data) => {
			this.ratingOptions = data;

			if (this.invoiceEntity.ratingId) {
				var obj = data.find((e) => { return e.id == this.invoiceEntity.ratingId });
				if (obj)
					this.invoiceEntityForm.get('ratingId').setValue(obj.id);
			}
		});

		this.staticService.getInvoiceEntityTypesForFilter().pipe(map(n => n.data as unknown as FilterModel[])).toPromise().then((data) => {
			this.ieTypeOptions = data;

			if (this.invoiceEntity.ieTypeId) {
				var obj = data.find((e) => { return e.id == this.invoiceEntity.ieTypeId });
				if (obj)
					this.invoiceEntityForm.get('ieTypeId').setValue(obj.id);
			}
		});


		this.staticService.getDiscountNetworksForFilter().pipe(map(n => n.data as unknown as FilterModel[])).toPromise().then((data) => {
			this.discountNetworkOptions = data;

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


	// cities
	loadCitiesForFilter() {
		this.staticService.getCitiesForFilter().subscribe(res => {
			this.citiesForFilter = res.data;

			this.filteredBillingCities = this.invoiceEntityForm.get('billingCityId').valueChanges
				.pipe(
					startWith(''),
					map(value => this._filterCities(value))
				);
			if (this.invoiceEntity.billingCityId > 0) {
				var elem = this.citiesForFilter.find(x => x.id == this.invoiceEntity.billingCityId);
				if (elem) {
					this.invoiceEntityForm.patchValue({ 'billingCityId': { id: elem.id, value: elem.value } });
				}
			}

			this.filteredMailingCities = this.invoiceEntityForm.get('mailingCityId').valueChanges
				.pipe(
					startWith(''),
					map(value => this._filterCities(value))
				);
			if (this.invoiceEntity.mailingCityId > 0) {
				var elem = this.citiesForFilter.find(x => x.id == this.invoiceEntity.mailingCityId);
				if (elem) {
					this.invoiceEntityForm.patchValue({ 'mailingCityId': { id: elem.id, value: elem.value } });
				}
			}

		});

	}
	private _filterCities(value: string): FilterModel[] {
		const filterValue = this._normalizeValue(value);
		return this.citiesForFilter.filter(title => this._normalizeValue(title.value).includes(filterValue));
	}
	// end clinic cities


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




}
