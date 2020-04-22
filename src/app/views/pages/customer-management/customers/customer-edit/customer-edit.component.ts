// Angular
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
// Material
import { MatDialog, MatSelect, MatTabChangeEvent } from '@angular/material';
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
	CustomerModel,
	CustomersService,
	StaticDataModel,

	StaticDataService,
	FilterModel,
	ApiResponse,

	InvoiceEntityModel,
	MedelitStaticData,
} from '../../../../../core/medelit';
import { NgxSpinnerService } from 'ngx-spinner';
import { CreateInvoiceEntityDialogComponent } from '../../../../partials/create-invoice-entity/create-invoice-entity.dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { MedelitConstants } from '../../../../../core/_base/constants/medelit-contstants';


@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-customer-edit',
	templateUrl: './customer-edit.component.html',
	styleUrls: ['./customer-edit.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerEditComponent implements OnInit, OnDestroy {
	// Public properties
	customer: CustomerModel;
	customerId$: Observable<number>;
	titles: Observable<StaticDataModel>;
	languages: Observable<StaticDataModel>;
	countries: Observable<StaticDataModel>;
	cities: Observable<StaticDataModel>;
	relationaships: Observable<StaticDataModel>;
	services: Observable<StaticDataModel>;
	oldCustomer: CustomerModel;
	selectedTab = 0;
	tabTitle: string = '';
	loadingSubject = new BehaviorSubject<boolean>(true);
	loading$: Observable<boolean>;
	customerForm: FormGroup;
	hasFormErrors = false;
	availableYears: number[] = [];
	filteredColors: Observable<string[]>;
	filteredManufactures: Observable<string[]>;
	// Private password
	private componentSubscriptions: Subscription;
	// sticky portlet header margin
	private headerMargin: number;
	selected = new FormControl(0);



	customersForFilter: FilterModel[] = [];
	filteredCustomers: Observable<FilterModel[]>;

	titlesForFilter: FilterModel[] = [];
	filteredTitles: Observable<FilterModel[]>;

	languagesForFilter: FilterModel[] = [];
	filteredLanguages: Observable<FilterModel[]>;

	countriesForCountryOfBirthForFilter: FilterModel[] = [];
	filteredCountriesForCountryOfBirth: Observable<FilterModel[]>;

	relationshipsForFilter: FilterModel[] = [];
	filteredRelationships: Observable<FilterModel[]>;

	servicesForFilter: FilterModel[] = [];
	filteredServices: Observable<FilterModel[]>;


	paymentMethodsOptions: FilterModel[];
	listedDiscountNetworkOptions: FilterModel[];
	buildingTypeOptions: FilterModel[];
	visitVenueOptions: FilterModel[];
	customerStatusOptions: FilterModel[];
	customerSourceOptions: FilterModel[];
	contactMethodOptions: FilterModel[];
	leadSourceOptions: FilterModel[];
	customerCategoryOptions: FilterModel[];

	invoiceEntitiesForFilter: FilterModel[] = [];
	filteredInvoiceEntities: Observable<FilterModel[]>;

	citiesForFilter: FilterModel[] = [];
	visitFilteredCities: Observable<FilterModel[]>;
	homeFilteredCities: Observable<FilterModel[]>;

	countriesForFilter: FilterModel[] = [];
	visitFilteredCountries: Observable<FilterModel[]>;
	homeFilteredCountries: Observable<FilterModel[]>;

	professionalsForFilter: FilterModel[] = [];
	filteredProfessionals: ReplaySubject<FilterModel[]> = new ReplaySubject<FilterModel[]>(1);
	public profMultiCtrl: FormControl = new FormControl();
	public profMultiFilterCtrl: FormControl = new FormControl();
	public filteredLangsMulti: ReplaySubject<FilterModel[]> = new ReplaySubject<FilterModel[]>(1);
	@ViewChild('multiSelect', { static: true }) multiSelect: MatSelect;
	protected _onDestroy = new Subject<void>();



	constructor(
		private store: Store<AppState>,
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private typesUtilsService: TypesUtilsService,
		private customerFB: FormBuilder,
		public dialog: MatDialog,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private layoutConfigService: LayoutConfigService,
		private customerService: CustomersService,
		private staticService: StaticDataService,
		private spinner: NgxSpinnerService,
		private translate: TranslateService,
		private cdr: ChangeDetectorRef) {
	}

	ngOnInit() {
		this.loading$ = this.loadingSubject.asObservable();
		this.loadingSubject.next(true);
		this.activatedRoute.params.subscribe(params => {
			const id = parseInt(params.id);
			if (id && id > 0) {

				//this.store.pipe(
				//	select(selectCustomerById(id))
				//).subscribe(result => {
				//	if (!result) {
				//		this.loadCustomerFromService(id);
				//		return;
				//	}

				//	this.loadCustomer(result);
				//});
				this.loadCustomerFromService(id);
			} else {
				const newCustomer = new CustomerModel();
				newCustomer.clear();
				this.loadCustomer(newCustomer);
			}
		});

		// sticky portlet header
		window.onload = () => {
			const style = getComputedStyle(document.getElementById('kt_header'));
			this.headerMargin = parseInt(style.height, 0);
		};
	}

	loadCustomer(_customer, fromService: boolean = false) {
		if (!_customer) {
			this.goBack('');
		}
		this.customer = _customer;
		this.customerId$ = of(_customer.id);
		this.oldCustomer = Object.assign({}, _customer);
		this.initCustomer();

		this.loadStaticResources();

		if (fromService) {
			this.cdr.detectChanges();
		}
	}

	loadCustomerFromService(customerId) {
		this.spinner.show();
		this.customerService.getCustomerById(customerId).toPromise().then(res => {
			this.spinner.hide();
			let data = res as unknown as ApiResponse;
			this.loadCustomer(data.data, true);
		}).catch((e) => {
			this.spinner.hide();
		});
	}

	ngOnDestroy() {
		if (this.componentSubscriptions) {
			this.componentSubscriptions.unsubscribe();
		}
	}

	initCustomer() {
		this.createForm();
		this.loadingSubject.next(false);
		if (!this.customer.id) {
			this.subheaderService.setBreadcrumbs([
				{ title: 'customer-management', page: `/customers` },
				{ title: 'Customers', page: `/customer-management/customers` },
				{ title: 'Create customer', page: `/customer-management/customers/add` }
			]);
			return;
		}
		this.subheaderService.setTitle('Customers');

		this.subheaderService.setBreadcrumbs([
			{ title: 'customer-management', page: `/customers` },
			{ title: 'Customers', page: `/customer-management/customers` },
			{ title: 'Edit customer', page: `/customer-management/customers/edit`, queryParams: { id: this.customer.id } }
		]);

	}

	createForm() {
		this.customerForm = this.customerFB.group({
			titleId: [this.customer.titleId, Validators.required],
			surName: [this.customer.surName, [Validators.required, Validators.min(4)]],
			name: [this.customer.name, [Validators.required]],
			languageId: [this.customer.languageId, [Validators.required]],
			leadSourceId: [this.customer.leadSourceId, [Validators.required]],

			mainPhone: [this.customer.mainPhone, [Validators.required, Validators.pattern(MedelitConstants.mobnumPattern)]],
			mainPhoneOwner: [this.customer.mainPhoneOwner, []],
			contactPhone: [this.customer.contactPhone, [Validators.required, Validators.pattern(MedelitConstants.mobnumPattern)]],
			phone2: [this.customer.phone2, [Validators.pattern(MedelitConstants.mobnumPattern)]],
			phone2Owner: [this.customer.phone2Owner, []],
			phone3: [this.customer.phone3, [Validators.pattern(MedelitConstants.mobnumPattern)]],
			phone3Owner: [this.customer.phone3Owner, []],
			email: [this.customer.email, [Validators.required, Validators.email,]],
			email2: [this.customer.email2, [Validators.email]],
			fax: [this.customer.fax, []],
			dateOfBirth: [this.customer.dateOfBirth, [Validators.required]],
			countryOfBirthId: [this.customer.countryOfBirthId, []],
			visitRequestingPerson: [this.customer.visitRequestingPerson, []],
			visitRequestingPersonRelationId: [this.customer.visitRequestingPersonRelationId, []],
			gpCode: [this.customer.gpCode, []],

			paymentMethodId: [this.customer.paymentMethodId, [Validators.required]],
			listedDiscountNetworkId: [this.customer.listedDiscountNetworkId, []],
			discount: [this.customer.discount, []],
			haveDifferentIEId: [this.customer.haveDifferentIEId, []],
			invoiceEntityId: [this.customer.invoiceEntityId, [Validators.required]],
			invoicingNotes: [this.customer.invoicingNotes, []],
			// address info
			visitStreetName: [this.customer.visitStreetName, [Validators.required]],
			homeStreetName: [this.customer.homeStreetName, [Validators.required]],
			visitPostCode: [this.customer.visitPostCode, [Validators.required]],
			homePostCode: [this.customer.homePostCode, [Validators.required]],
			visitCityId: [this.customer.visitCityId, [Validators.required]],
			homeCityId: [this.customer.homeCityId, [Validators.required]],
			visitCountryId: [this.customer.visitCountryId, [Validators.required]],
			homeCountryId: [this.customer.homeCountryId, [Validators.required]],
			buildingTypeId: [this.customer.buildingTypeId, [Validators.required]],
			contactMethodId: [this.customer.contactMethodId, [Validators.required]],
			buzzer: [this.customer.buzzer, []],
			flatNumber: [this.customer.flatNumber, []],
			floor: [this.customer.floor, []],
			visitVenueId: [this.customer.visitVenueId, [Validators.required]],
			addressNotes: [this.customer.addressNotes, []],
			visitVenueDetail: [this.customer.visitVenueDetail, []],

			// bank info
			bankName: [this.customer.bankName, []],
			accountNumber: [this.customer.accountNumber, []],
			sortCode: [this.customer.sortCode, []],
			iban: [this.customer.iban, []],
			insuranceCoverId: [this.customer.insuranceCoverId, [Validators.required]],

			blacklistId: [this.customer.blacklistId.toString(), []],
		});

	}

	goBack(id) {
		this.loadingSubject.next(false);
		const url = `/customer-management/customers?id=${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	goBackWithoutId() {
		this.router.navigateByUrl('/customer-management/customers', { relativeTo: this.activatedRoute });
	}

	refreshCustomer(isNew: boolean = false, id = 0) {
		this.loadingSubject.next(false);
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/customer-management/customers/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	reset() {
		this.customer = Object.assign({}, this.oldCustomer);
		this.createForm();
		this.hasFormErrors = false;
		this.customerForm.markAsPristine();
		this.customerForm.markAsUntouched();
		this.customerForm.updateValueAndValidity();
	}

	onSumbit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.customerForm.controls;
		/** check form */
		if (this.customerForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			window.scroll(0, 0);
			return;
		}

		// tslint:disable-next-line:prefer-const
		let editedCustomer = this.prepareCustomer();

		if (editedCustomer.id > 0) {
			this.updateCustomer(editedCustomer, withBack);
			return;
		}

		this.addCustomer(editedCustomer, withBack);
	}

	prepareCustomer(): CustomerModel {
		const controls = this.customerForm.controls;
		const _customer = new CustomerModel();
		_customer.id = this.customer.id;
		if (controls.titleId.value)
			_customer.titleId = +controls.titleId.value.id;
		_customer.surName = controls.surName.value;
		_customer.name = controls.name.value;
		if (controls.languageId.value)
			_customer.languageId = +controls.languageId.value.id;
		_customer.leadSourceId = controls.leadSourceId.value;
		_customer.mainPhone = controls.mainPhone.value;
		_customer.mainPhoneOwner = controls.mainPhoneOwner.value;
		_customer.contactPhone = controls.contactPhone.value;
		_customer.phone2 = controls.phone2.value;
		_customer.phone2Owner = controls.phone2Owner.value;
		_customer.phone3 = controls.phone3.value;
		_customer.phone3Owner = controls.phone3Owner.value;
		_customer.email = controls.email.value;
		_customer.fax = controls.fax.value;
		_customer.dateOfBirth = controls.dateOfBirth.value;
		if (controls.countryOfBirthId.value)
			_customer.countryOfBirthId = controls.countryOfBirthId.value.id;
		_customer.visitRequestingPerson = controls.visitRequestingPerson.value;
		if (controls.visitRequestingPersonRelationId.value)
			_customer.visitRequestingPersonRelationId = controls.visitRequestingPersonRelationId.value.id;
		_customer.gpCode = controls.gpCode.value;

		_customer.paymentMethodId = controls.paymentMethodId.value;
		_customer.listedDiscountNetworkId = controls.listedDiscountNetworkId.value;
		_customer.discount = controls.discount.value;
		if (controls.invoiceEntityId.value)
			_customer.invoiceEntityId = controls.invoiceEntityId.value.id;
		_customer.invoicingNotes = controls.invoicingNotes.value;

		// address info
		_customer.visitStreetName = controls.visitStreetName.value;
		_customer.homeStreetName = controls.homeStreetName.value;
		_customer.visitPostCode = controls.visitPostCode.value;
		_customer.homePostCode = controls.homePostCode.value;
		if (controls.visitCityId.value)
			_customer.visitCityId = controls.visitCityId.value.id;
		if (controls.homeCityId.value)
			_customer.homeCityId = controls.homeCityId.value.id;

		if (controls.visitCountryId.value)
			_customer.visitCountryId = controls.visitCountryId.value.id;
		if (controls.homeCountryId.value)
			_customer.homeCountryId = controls.homeCountryId.value.id;

		_customer.buildingTypeId = controls.buildingTypeId.value;
		_customer.contactMethodId = controls.contactMethodId.value;
		_customer.buzzer = controls.buzzer.value;
		_customer.flatNumber = controls.flatNumber.value;
		_customer.floor = controls.floor.value;
		_customer.visitVenueId = controls.visitVenueId.value;
		_customer.addressNotes = controls.addressNotes.value;
		_customer.visitVenueDetail = controls.visitVenueDetail.value;

		// bank info
		_customer.bankName = controls.bankName.value;
		_customer.accountNumber = controls.accountNumber.value;
		_customer.sortCode = controls.sortCode.value;
		_customer.iban = controls.iban.value;
		_customer.blacklistId = +controls.blacklistId.value;
		_customer.insuranceCoverId = +controls.insuranceCoverId.value;
		_customer.haveDifferentIEId = +controls.haveDifferentIEId.value;

		return _customer;
	}

	addCustomer(_customer: CustomerModel, withBack: boolean = false) {
		this.spinner.show();
		this.customerService.createCustomer(_customer).toPromise().then((res) => {
			this.spinner.hide();
			const resp = res as unknown as ApiResponse;
			if (resp.success && resp.data.id > 0) {
				const message = `New customer successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 10000, true, true);
				this.refreshCustomer(true, resp.data.id);
			} else {
				const message = `An error occured while processing your request. Please try again later.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 10000, true, true);
			}
		}).catch((e) => {
			this.spinner.hide();
		});



		//this.store.dispatch(new CustomerOnServerCreated({ customer: _customer }));
		//this.componentSubscriptions = this.store.pipe(
		//	delay(1000),
		//	select(selectLastCreatedCustomerId)
		//).subscribe(newId => {
		//	if (!newId) {
		//		return;
		//	}

		//	this.loadingSubject.next(false);
		//	if (withBack) {
		//		this.goBack(newId);
		//	} else {
		//		const message = `New customer successfully has been added.`;
		//		this.layoutUtilsService.showActionNotification(message, MessageType.Create, 10000, true, true);
		//		this.refreshCustomer(true, newId);
		//	}
		//});
	}

	updateCustomer(_customer: CustomerModel, withBack: boolean = false) {
		this.spinner.show();
		this.customerService.updateCustomer(_customer).toPromise().then((res) => {
			this.spinner.hide();
			const resp = res as unknown as ApiResponse;
			if (resp.success && resp.data.id > 0) {
				const _customer = resp.data as unknown as CustomerModel;
				this.loadCustomer(_customer, true);

				const message = `Customer successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 10000, true, true);
				this.refreshCustomer(false);
			} else {
				const message = `An error occured while processing your request. Please try again later.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 10000, true, true);
			}
		}).catch((e) => {
			this.spinner.hide();
		});

		//this.loadingSubject.next(true);
		//const updateCustomer: Update<CustomerModel> = {
		//	id: _customer.id,
		//	changes: _customer
		//};

		//this.store.dispatch(new CustomerUpdated({
		//	partialCustomer: updateCustomer,
		//	customer: _customer
		//}));

		//of(undefined).pipe(delay(3000)).subscribe(() => { // Remove this line
		//	if (withBack) {
		//		this.goBack(_customer.id);
		//	} else {
		//		const message = `Customer successfully has been saved.`;
		//		this.layoutUtilsService.showActionNotification(message, MessageType.Update, 10000, true, true);
		//		this.refreshCustomer(false);
		//	}
		//}); 
	}

	getComponentTitle() {

		let result = 'Create service';
		if (this.selectedTab == 0) {
			if (!this.customer || !this.customer.id) {
				return result;
			}
			result = `Edit customer - ${this.customer.surName} ${this.customer.name}`;
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
		this.loadInvoiceEntitiesForFilter();
		this.loadTitlesForFilter();
		this.loadLanguagesForFilter();
		this.loadCountriesForCountryOfBirthFilter();
		this.loadRelationshipsForFilter();
		this.subscribeInvoiceEntity();
		this.loadVisitCitiesForFilter();
		this.loadCountiesForFilter();
		this.loadProfessionalsForFilter();

		this.staticService.getStaticDataForFitler().pipe(map(n => n.data as unknown as MedelitStaticData[])).toPromise().then((data) => {
			this.paymentMethodsOptions = data.map((el) => { return { id: el.id, value: el.paymentMethods }; }).filter((e) => { if (e.value && e.value.length > 0) return e; });
			if (this.customer.paymentMethodId) {
				var obj = this.paymentMethodsOptions.find((e) => { return e.id == this.customer.paymentMethodId });
				if (obj)
					this.customerForm.get('paymentMethodId').setValue(obj.id);
			}

			this.listedDiscountNetworkOptions = data.map((el) => { return { id: el.id, value: el.discountNetworks }; }).filter((e) => { if (e.value && e.value.length > 0) return e; });;

			if (this.customer.listedDiscountNetworkId) {
				var obj = this.paymentMethodsOptions.find((e) => { return e.id == this.customer.listedDiscountNetworkId });
				if (obj)
					this.customerForm.get('listedDiscountNetworkId').setValue(obj.id);
			}

			this.buildingTypeOptions = data.map((el) => { return { id: el.id, value: el.buildingTypes }; }).filter((e) => { if (e.value && e.value.length > 0) return e; });

			if (this.customer.buildingTypeId) {
				var obj = this.buildingTypeOptions.find((e) => { return e.id == this.customer.buildingTypeId });
				if (obj)
					this.customerForm.get('buildingTypeId').setValue(obj.id);
			}

			this.visitVenueOptions = data.map((el) => { return { id: el.id, value: el.visitVenues }; }).filter((e) => { if (e.value && e.value.length > 0) return e; });

			if (this.customer.visitVenueId) {
				const obj = this.visitVenueOptions.find((e) => { return e.id == this.customer.visitVenueId });
				if (obj)
					this.customerForm.get('visitVenueId').setValue(obj.id);
			}

			this.contactMethodOptions = data.map((el) => { return { id: el.id, value: el.contactMethods }; }).filter((e) => { if (e.value && e.value.length > 0) return e; });

			if (this.customer.contactMethodId) {
				const obj = this.contactMethodOptions.find((e) => { return e.id == this.customer.contactMethodId });
				if (obj)
					this.customerForm.get('contactMethodId').setValue(obj.id);
			}

			this.leadSourceOptions = data.map((el) => { return { id: el.id, value: el.leadSources }; }).filter((e) => { if (e.value && e.value.length > 0) return e; });

			if (this.customer.leadSourceId) {
				const obj = this.leadSourceOptions.find((e) => { return e.id == this.customer.leadSourceId });
				if (obj)
					this.customerForm.get('leadSourceId').setValue(obj.id);
			}
		});


		if (this.customer.insuranceCoverId !== null) {
			this.customerForm.get('insuranceCoverId').setValue(this.customer.insuranceCoverId.toString());
		}
		if (this.customer.haveDifferentIEId !== null) {
			this.customerForm.get('haveDifferentIEId').setValue(this.customer.haveDifferentIEId.toString());
		}
	}

	//// Customers

	// titles
	loadTitlesForFilter() {
		this.staticService.getTitlesForFilter().subscribe(res => {
			this.titlesForFilter = res.data;

			this.filteredTitles = this.customerForm.get('titleId').valueChanges
				.pipe(
					startWith(''),
					map(value => this._filterTitles(value))
				);
			if (this.customer.titleId > 0) {
				var title = this.titlesForFilter.find(x => x.id == this.customer.titleId);
				if (title) {
					this.customerForm.patchValue({ 'titleId': { id: title.id, value: title.value } });
				}
			}
		});

	}
	private _filterTitles(value: string): FilterModel[] {
		const filterValue = this._normalizeValue(value);
		return this.titlesForFilter.filter(title => this._normalizeValue(title.value).includes(filterValue));
	}

	//// Languages
	loadLanguagesForFilter() {
		this.staticService.getLanguagesForFilter().subscribe(res => {
			this.languagesForFilter = res.data;

			this.filteredLanguages = this.customerForm.get('languageId').valueChanges
				.pipe(
					startWith(''),
					map(value => this._filterLanguages(value))
				);
			if (this.customer.languageId > 0) {
				var title = this.languagesForFilter.find(x => x.id == this.customer.languageId);
				if (title) {
					this.customerForm.patchValue({ 'languageId': { id: title.id, value: title.value } });
				}
			}
		});

	}
	private _filterLanguages(value: string): FilterModel[] {
		const filterValue = this._normalizeValue(value);
		return this.languagesForFilter.filter(title => this._normalizeValue(title.value).includes(filterValue));
	}
	// end languages

	//// Country of Birth
	loadCountriesForCountryOfBirthFilter() {
		this.staticService.getCountriesForFilter().subscribe(res => {
			this.countriesForCountryOfBirthForFilter = res.data;

			this.filteredCountriesForCountryOfBirth = this.customerForm.get('countryOfBirthId').valueChanges
				.pipe(
					startWith(''),
					map(value => this.filteredCountryOfBirth(value))
				);
			if (this.customer.countryOfBirthId > 0) {
				var title = this.countriesForCountryOfBirthForFilter.find(x => x.id == this.customer.countryOfBirthId);
				if (title) {
					this.customerForm.patchValue({ 'countryOfBirthId': { id: title.id, value: title.value } });
				}
			}
		});

	}
	private filteredCountryOfBirth(value: string): FilterModel[] {
		const filterValue = this._normalizeValue(value);
		return this.countriesForCountryOfBirthForFilter.filter(title => this._normalizeValue(title.value).includes(filterValue));
	}
	// end Country of Birth

	//// relationships
	loadRelationshipsForFilter() {
		this.staticService.getRelationshipsForFilter().subscribe(res => {
			this.relationshipsForFilter = res.data;

			this.filteredRelationships = this.customerForm.get('visitRequestingPersonRelationId').valueChanges
				.pipe(
					startWith(''),
					map(value => this._filterRelationships(value))
				);
			if (this.customer.visitRequestingPersonRelationId > 0) {
				var title = this.relationshipsForFilter.find(x => x.id == this.customer.titleId);
				if (title) {
					this.customerForm.patchValue({ 'visitRequestingPersonRelationId': { id: title.id, value: title.value } });
				}
			}
		});

	}
	private _filterRelationships(value: string): FilterModel[] {
		const filterValue = this._normalizeValue(value);
		return this.relationshipsForFilter.filter(title => this._normalizeValue(title.value).includes(filterValue));
	}
	// end relationships


	//// Invoice Entities
	loadInvoiceEntitiesForFilter() {
		this.staticService.getInvoiceEntitiesForFilter().subscribe(res => {
			this.invoiceEntitiesForFilter = res.data;

			this.filteredInvoiceEntities = this.customerForm.get('invoiceEntityId').valueChanges
				.pipe(
					startWith(''),
					map(value => this._filterInvoiceEntities(value))
				);
			if (this.customer.invoiceEntityId > 0) {
				var ie = this.invoiceEntitiesForFilter.find(x => x.id == this.customer.invoiceEntityId);
				if (ie) {
					this.customerForm.patchValue({ 'invoiceEntityId': { id: ie.id, value: ie.value } });
				}
			}
		});

	}
	private _filterInvoiceEntities(value: string): FilterModel[] {
		const filterValue = this._normalizeValue(value);
		return this.invoiceEntitiesForFilter.filter(title => this._normalizeValue(title.value).includes(filterValue));
	}

	subscribeInvoiceEntity() {
		var differetIdControl = this.customerForm.get('haveDifferentIEId');
		var ieControl = this.customerForm.get('invoiceEntityId');

		if (differetIdControl.value == 0) {
			ieControl.disable();
		} else {
			ieControl.enable();
			this.loadInvoiceEntitiesForFilter();
		}

		differetIdControl.valueChanges
			.subscribe((v) => {
				if (v == 0) {
					ieControl.disable();
					ieControl.setValue('');
					this.invoiceEntitiesForFilter = [];
					this.filteredInvoiceEntities = new Observable<FilterModel[]>();
				}
				else {
					ieControl.enable();
					this.loadInvoiceEntitiesForFilter();
				}
			});
	}

	createNewIE() {
		let saveMessageTranslateParam = 'MEDELIT.LEADS.INVOICE_ENTITY_CREATED_SUCCESS';
		//saveMessageTranslateParam += this.lead.id > 0 ? 'UPDATE_MESSAGE' : 'ADD_MESSAGE';
		const _saveMessage = this.translate.instant(saveMessageTranslateParam);
		const _messageType = this.customer.id > 0 ? MessageType.Update : MessageType.Create;
		var ieModel = new InvoiceEntityModel();
		const controls = this.customerForm.controls;
		ieModel.mainPhoneNumber = controls.mainPhone.value;
		ieModel.mainPhoneNumberOwner = controls.mainPhoneOwner.value;
		ieModel.phone2 = controls.phone2.value;
		ieModel.phone2Owner = controls.phone2Owner.value;
		ieModel.phone3 = controls.phone3.value;
		ieModel.phone3Owner = controls.phone3Owner.value;
		ieModel.email = controls.email.value;
		ieModel.email2 = controls.email2.value;
		ieModel.relationshipWithCustomerId = controls.visitRequestingPersonRelationId.value;
		ieModel.fax = controls.fax.value;
		ieModel.dateOfBirth = controls.dateOfBirth.value;
		if (controls.countryOfBirthId.value)
			ieModel.countryOfBirthId = controls.countryOfBirthId.value.id;
		ieModel.billingAddress = controls.addressStreetName.value;
		ieModel.mailingAddress = controls.addressStreetName.value;
		ieModel.billingPostCode = controls.postalCode.value;
		ieModel.mailingPostCode = controls.postalCode.value;
		if (controls.cityId.value)
			ieModel.billingCityId = controls.cityId.value.id;
		if (controls.cityId.value)
			ieModel.mailingCityId = controls.cityId.value.id;
		if (controls.countryId.value)
			ieModel.billingCountryId = controls.countryId.value.id;
		if (controls.countryId.value)
			ieModel.mailingCountryId = controls.countryId.value.id;
		ieModel.description = controls.leadDescription.value;
		ieModel.paymentMethodId = controls.preferredPaymentMethodId.value;
		ieModel.bank = controls.bankName.value;
		ieModel.accountNumber = controls.accountNumber.value;
		ieModel.sortCode = controls.sortCode.value;
		ieModel.iban = controls.iban.value;
		ieModel.insuranceCoverId = controls.insuranceCoverId.value;
		ieModel.invoicingNotes = controls.invoicingNotes.value;
		ieModel.discountNetworkId = controls.listedDiscountNetworkId.value;
		ieModel.discountPercent = controls.discount.value;
		ieModel.personOfReference = controls.visitRequestingPerson.value;
		ieModel.personOfReferenceEmail = controls.email.value;
		ieModel.personOfReferencePhone = controls.mainPhone.value;
		ieModel.blackListId = controls.blacklistId.value;
		ieModel.discountPercent = controls.discount.value;

		const dialogRef = this.dialog.open(CreateInvoiceEntityDialogComponent, { data: ieModel });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.loadInvoiceEntitiesForFilter();

			this.layoutUtilsService.showActionNotification(_saveMessage, _messageType);
			this.detectChanges();
			//this.refreshLead(false, this.lead.id);
		});

	}

	// end Invoice Entities

	// cities
	loadVisitCitiesForFilter() {
		this.staticService.getCitiesForFilter().subscribe(res => {
			this.citiesForFilter = res.data;

			this.visitFilteredCities = this.customerForm.get('visitCityId').valueChanges
				.pipe(
					startWith(''),
					map(value => this._filterCities(value))
				);
			this.homeFilteredCities = this.customerForm.get('homeCityId').valueChanges
				.pipe(
					startWith(''),
					map(value => this._filterCities(value))
				);


			if (this.customer.visitCityId > 0) {
				var elem = this.citiesForFilter.find(x => x.id == this.customer.visitCityId);
				if (elem) {
					this.customerForm.patchValue({ 'visitCityId': { id: elem.id, value: elem.value } });
				}
			}

			if (this.customer.homeCityId > 0) {
				var elem = this.citiesForFilter.find(x => x.id == this.customer.homeCityId);
				if (elem) {
					this.customerForm.patchValue({ 'homeCityId': { id: elem.id, value: elem.value } });
				}
			}
		});
	}
	private _filterCities(value: string): FilterModel[] {
		const filterValue = this._normalizeValue(value);
		return this.citiesForFilter.filter(title => this._normalizeValue(title.value).includes(filterValue));
	}
	// end clinic cities

	// countries
	loadCountiesForFilter() {
		this.staticService.getCountriesForFilter().subscribe(res => {
			this.countriesForFilter = res.data;

			this.visitFilteredCountries = this.customerForm.get('visitCountryId').valueChanges
				.pipe(
					startWith(''),
					map(value => this._filterCountries(value))
				);
			this.homeFilteredCountries = this.customerForm.get('homeCountryId').valueChanges
				.pipe(
					startWith(''),
					map(value => this._filterCountries(value))
				);

			if (this.customer.visitCountryId > 0) {
				var elem = this.countriesForFilter.find(x => x.id == this.customer.visitCountryId);
				if (elem) {
					this.customerForm.patchValue({ 'visitCountryId': { id: elem.id, value: elem.value } });
				}
			}
			if (this.customer.homeCountryId > 0) {
				var elem = this.countriesForFilter.find(x => x.id == this.customer.homeCountryId);
				if (elem) {
					this.customerForm.patchValue({ 'homeCountryId': { id: elem.id, value: elem.value } });
				}
			}
		});

	}
	private _filterCountries(value: string): FilterModel[] {
		const filterValue = this._normalizeValue(value);
		return this.countriesForFilter.filter(title => this._normalizeValue(title.value).includes(filterValue));
	}
	// end account code id filter


	// Professionals Filter
	loadProfessionalsForFilter() {
		this.staticService.getProfessionalsForFilter().subscribe(res => {
			this.professionalsForFilter = res.data;
			this.filteredProfessionals.next(this.professionalsForFilter.slice());

			if (this.customer.id) {
				var profs = this.customer.connectedProfessionals as unknown as FilterModel[];
				var select: FilterModel[] = [];
				profs && profs.forEach((x) => {
					var findIndex = this.professionalsForFilter.findIndex((el) => { return el.id == x.id });
					if (findIndex > -1)
						select.push(this.professionalsForFilter[findIndex]);

				});
				this.customerForm.patchValue({ 'connectedProfessionals': select });
			}


			this.profMultiFilterCtrl.valueChanges
				.pipe(takeUntil(this._onDestroy))
				.subscribe(() => {
					this.filterLangsMulti();
				});
		});
	}

	private filterLangsMulti() {
		if (!this.professionalsForFilter) {
			return;
		}
		// get the search keyword
		let search = this.profMultiFilterCtrl.value;
		if (!search) {
			this.filteredProfessionals.next(this.professionalsForFilter.slice());
			return;
		} else {
			search = search.toLowerCase();
		}
		// filter the banks
		this.filteredProfessionals.next(
			this.professionalsForFilter.filter(bank => bank.value.toLowerCase().indexOf(search) > -1)
		);
	}
	// end professionals fitler



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
		const val = this.customerForm.get(control).value;
		if (val && val.id) return;
		this.customerForm.get(control).setValue('');
		this.cdr.markForCheck();
	}

	/*End Closed events */

	detectChanges() {
		try {
			this.cdr.detectChanges();
		} catch {

		}
	}

	tabChanged(event: MatTabChangeEvent) {
		this.tabTitle = event.tab.textLabel;
	}
}
