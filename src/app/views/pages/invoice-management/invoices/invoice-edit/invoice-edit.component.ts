// Angular
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
// Material
import { MatDialog, MatSelect, DateAdapter, MAT_DATE_FORMATS } from '@angular/material';
// RxJS
import { Observable, BehaviorSubject, Subscription, of, ReplaySubject, Subject } from 'rxjs';
import { map, startWith, delay, first, takeUntil } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
import { Dictionary, Update } from '@ngrx/entity';
import { AppState } from '../../../../../core/reducers';
// Layout
import { SubheaderService, LayoutConfigService } from '../../../../../core/_base/layout';
// CRUD
import { LayoutUtilsService, TypesUtilsService, MessageType } from '../../../../../core/_base/crud';
// Services and Models
import {
	selectLastCreatedInvoiceId,
	selectInvoiceById,
	SPECIFICATIONS_DICTIONARY,
	InvoiceModel,
	InvoiceOnServerCreated,
	InvoiceUpdated,
	InvoicesService,
	StaticDataModel,

	StaticDataService,
	FilterModel,
	ApiResponse,

    BookingViewModel,
    InvoiceBookings
} from '../../../../../core/medelit';
import { NgxSpinnerService } from 'ngx-spinner';
import { ConfirmDialogModel, ConfirmDialogComponent } from '../../../../partials/confirm-dialog/confirm-dialog.component';


@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-invoice-edit',
	templateUrl: './invoice-edit.component.html',
	styleUrls: ['./invoice-edit.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoiceEditComponent implements OnInit, OnDestroy {
	// Public properties
	invoice: InvoiceModel;
	invoiceId$: Observable<number>;
	titles: Observable<StaticDataModel>;
	languages: Observable<StaticDataModel>;
	countries: Observable<StaticDataModel>;
	cities: Observable<StaticDataModel>;
	relationaships: Observable<StaticDataModel>;
	services: Observable<StaticDataModel>;
	oldInvoice: InvoiceModel;
	selectedTab = 0;
	loadingSubject = new BehaviorSubject<boolean>(true);
	loading$: Observable<boolean>;
	invoiceForm: FormGroup;
	hasFormErrors = false;
	availableYears: number[] = [];
	filteredColors: Observable<string[]>;
	filteredManufactures: Observable<string[]>;
	// Private password
	private componentSubscriptions: Subscription;
	// sticky portlet header margin
	private headerMargin: number;
	selected = new FormControl(0);


	servicesForFilter: FilterModel[] = [];
	filteredServices: Observable<FilterModel[]>;

	professionalsForFilter: FilterModel[] = [];
	filteredProfessionals: Observable<FilterModel[]>;

	paymentMethodsOptions: FilterModel[];
	invoiceStatusOptions: FilterModel[];
	invoiceSourceOptions: FilterModel[];
	contactMethodOptions: FilterModel[];
	invoiceCategoryOptions: FilterModel[];

	invoiceEntitiesForFilter: FilterModel[] = [];
	filteredInvoiceEntities: Observable<FilterModel[]>;

	citiesForFilter: FilterModel[] = [];
	filteredBillingCities: Observable<FilterModel[]>;
	filteredMailingCities: Observable<FilterModel[]>;

	countriesForFilter: FilterModel[] = [];
	filteredBillingCountries: Observable<FilterModel[]>;
	filteredMailingCountries: Observable<FilterModel[]>;

	constructor(
		private store: Store<AppState>,
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private typesUtilsService: TypesUtilsService,
		private invoiceFB: FormBuilder,
		public dialog: MatDialog,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private layoutConfigService: LayoutConfigService,
		private invoiceService: InvoicesService,
		private staticService: StaticDataService,
		private spinner: NgxSpinnerService,
		private cdr: ChangeDetectorRef) {
	}

	ngOnInit() {
		this.loading$ = this.loadingSubject.asObservable();
		this.loadingSubject.next(true);
		this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id && id > 0) {

				//this.store.pipe(
				//	select(selectInvoiceById(id))
				//).subscribe(result => {
				//	if (!result) {
				//		this.loadInvoiceFromService(id);
				//		return;
				//	}

				//	this.loadInvoice(result);
				//});
				this.loadInvoiceFromService(id);
			} else {
				const newInvoice = new InvoiceModel();
				newInvoice.clear();
				this.loadInvoice(newInvoice);
			}
		});

		// sticky portlet header
		window.onload = () => {
			const style = getComputedStyle(document.getElementById('kt_header'));
			this.headerMargin = parseInt(style.height, 0);
		};
	}

	loadInvoice(_invoice, fromService: boolean = false) {
		if (!_invoice) {
			this.goBack('');
		}
		this.invoice = _invoice;
		this.invoiceId$ = of(_invoice.id);
		this.oldInvoice = Object.assign({}, _invoice);
		this.initInvoice();

		this.loadStaticResources();

		if (fromService) {
			this.cdr.detectChanges();
		}
	}

	loadInvoiceFromService(invoiceId) {
		this.loadingSubject.next(true);
		this.invoiceService.getInvoiceById(invoiceId).toPromise().then(res => {
			this.loadingSubject.next(false);
			let data = res as unknown as ApiResponse;
			this.loadInvoice(data.data, true);
		}).catch((e) => {
			this.loadingSubject.next(false);
		});
	}

	ngOnDestroy() {
		if (this.componentSubscriptions) {
			this.componentSubscriptions.unsubscribe();
		}
	}

	initInvoice() {
		this.createForm();
		this.loadingSubject.next(false);
		if (!this.invoice.id) {
			this.subheaderService.setBreadcrumbs([
				{ title: 'invoice-management', page: `/invoices` },
				{ title: 'Invoices', page: `/invoice-management/invoices` },
				{ title: 'Create invoice', page: `/invoice-management/invoices/add` }
			]);
			return;
		}
		this.subheaderService.setTitle('Invoices');

		this.subheaderService.setBreadcrumbs([
			{ title: 'invoice-management', page: `/invoices` },
			{ title: 'Invoices', page: `/invoice-management/invoices` },
			{ title: 'Edit invoice', page: `/invoice-management/invoices/edit`, queryParams: { id: this.invoice.id } }
		]);

	}

	createForm() {
		this.invoiceForm = this.invoiceFB.group({
			invoiceNumber: [this.invoice.invoiceNumber, [Validators.required]],
			subject: [this.invoice.subject, [Validators.required]],
			invoiceEntityId: [this.invoice.invoiceEntityId, [Validators.required]],
			patientDateOfBirth: [this.invoice.patientDateOfBirth, [Validators.required]],
			statusId: [this.invoice.statusId, [Validators.required]],
			dueDate: [this.invoice.dueDate, [Validators.required]],
			invoiceDate: [this.invoice.invoiceDate, [Validators.required]],
			invoiceDeliveryDate: [this.invoice.invoiceDeliveryDate, [Validators.required]],
			invoiceSentByEmailId: [this.invoice.invoiceSentByEmailId, [Validators.required]],
			invoiceSentByMailId: [this.invoice.invoiceSentByMailId, [Validators.required]],
			// Billing Address
			ieBillingAddress: [this.invoice.ieBillingAddress, [Validators.required]],
			ieBillingPostCode: [this.invoice.ieBillingPostCode, [Validators.required]],
			ieBillingCityId: [this.invoice.ieBillingCityId, [Validators.required]],
			ieBillingCountryId: [this.invoice.ieBillingCountryId, [Validators.required]],

			// mailing address
			mailingAddress: [this.invoice.mailingAddress, [Validators.required]],
			mailingPostCode: [this.invoice.mailingPostCode, [Validators.required]],
			mailingCityId: [this.invoice.mailingCityId, [Validators.required]],
			mailingCountryId: [this.invoice.mailingCountryId, [Validators.required]],

			// payment and invoicing
			paymentMethodId: [this.invoice.paymentMethodId, [Validators.required]],
			insuranceCoverId: [this.invoice.insuranceCoverId, [Validators.required]],
			invoiceNotes: [this.invoice.invoiceNotes, [Validators.required]],
			invoiceDiagnosis: [this.invoice.invoiceDiagnosis, [Validators.required]],
	
		});
		
	}

	goBack(id) {
		this.loadingSubject.next(false);
		const url = `/invoice-management/invoices?id=${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	goBackWithoutId() {
		this.router.navigateByUrl('/invoice-management/invoices', { relativeTo: this.activatedRoute });
	}

	refreshInvoice(isNew: boolean = false, id = 0) {
		this.loadingSubject.next(false);
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/invoice-management/invoices/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	reset() {
		this.invoice = Object.assign({}, this.oldInvoice);
		this.initInvoice();
		this.loadStaticResources();
		this.hasFormErrors = false;
		this.invoiceForm.markAsPristine();
		this.invoiceForm.markAsUntouched();
		this.invoiceForm.updateValueAndValidity();
	}

	onSumbit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.invoiceForm.controls;
		/** check form */
		if (this.invoiceForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);
			
			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		// tslint:disable-next-line:prefer-const
		let editedInvoice = this.prepareInvoice();

		if (editedInvoice.id > 0) {
			this.updateInvoice(editedInvoice, withBack);
			return;
		}

		this.addInvoice(editedInvoice, withBack);
	}

	prepareInvoice(): InvoiceModel {
		const controls = this.invoiceForm.controls;
		const _invoice = new InvoiceModel();
		_invoice.id = this.invoice.id;
		_invoice.subject = controls.subject.value;
		_invoice.invoiceNumber = controls.invoiceNumber.value;
		_invoice.patientDateOfBirth = controls.patientDateOfBirth.value;
		if (controls.invoiceEntityId.value)
			_invoice.invoiceEntityId = +controls.invoiceEntityId.value.id;
		_invoice.statusId = controls.statusId.value;
		_invoice.dueDate = controls.dueDate.value;
		_invoice.invoiceDate = controls.invoiceDate.value;
		_invoice.invoiceDeliveryDate = controls.invoiceDeliveryDate.value;
		_invoice.invoiceSentByEmailId = +controls.invoiceSentByEmailId.value;
		_invoice.invoiceSentByMailId = +controls.invoiceSentByMailId.value;
		// billing address
		_invoice.ieBillingAddress = controls.ieBillingAddress.value;
		_invoice.ieBillingPostCode = controls.ieBillingPostCode.value;
		if (controls.ieBillingCityId.value)
			_invoice.ieBillingCityId = controls.ieBillingCityId.value.id;
		if (controls.ieBillingCountryId.value)
			_invoice.ieBillingCountryId = controls.ieBillingCountryId.value.id;
		// mailing addres
		_invoice.mailingAddress = controls.mailingAddress.value;
		_invoice.mailingPostCode = controls.mailingPostCode.value;
		if (controls.mailingCityId.value)
			_invoice.mailingCityId = controls.mailingCityId.value.id;
		if (controls.mailingCountryId.value)
			_invoice.mailingCountryId = controls.mailingCountryId.value.id;

		//payment and invoicing
		_invoice.paymentMethodId = controls.paymentMethodId.value;
		_invoice.insuranceCoverId = controls.insuranceCoverId.value;
		_invoice.invoiceNotes = controls.invoiceNotes.value;
		_invoice.invoiceDiagnosis = controls.invoiceDiagnosis.value;
		
		return _invoice;
	}

	deleteService(invoiceBooking: InvoiceBookings) {
		let result: string;
		const message = `Are you sure you want to do this?`;
		const dialogData = new ConfirmDialogModel("Confirm Action", message);

		const dialogRef = this.dialog.open(ConfirmDialogComponent, {
			maxWidth: "300px",
			data: dialogData
		});

		dialogRef.afterClosed().subscribe(dialogResult => {
			if (dialogResult) {
				this.spinner.show();
				this.invoiceService.deleteInvoiceBooking(invoiceBooking).toPromise().then((res) => {
					if (res.success) {
						this.layoutUtilsService.showActionNotification('Booking removed successfully.', MessageType.Create, 3000, true);
						this.loadInvoiceFromService(this.invoice.id);
					}
				}).catch(() => {
					this.spinner.hide();
				}).finally(() => {
					this.spinner.hide();
				});
			}
		});
	}

	addInvoice(_invoice: InvoiceModel, withBack: boolean = false) {
		this.spinner.show();
		this.invoiceService.createInvoice(_invoice).toPromise().then((res) => {
			this.spinner.hide();
			const resp = res as unknown as ApiResponse;
			if (resp.success && resp.data.id > 0) {
				const message = `New invoice successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 10000, true, true);
				this.refreshInvoice(true, resp.data.id);
			} else {
				const message = `An error occured while processing your request. Please try again later.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 10000, true, true);
			}
		}).catch((e) => {
			this.spinner.hide();
		});



		//this.store.dispatch(new InvoiceOnServerCreated({ invoice: _invoice }));
		//this.componentSubscriptions = this.store.pipe(
		//	delay(1000),
		//	select(selectLastCreatedInvoiceId)
		//).subscribe(newId => {
		//	if (!newId) {
		//		return;
		//	}

		//	this.loadingSubject.next(false);
		//	if (withBack) {
		//		this.goBack(newId);
		//	} else {
		//		const message = `New invoice successfully has been added.`;
		//		this.layoutUtilsService.showActionNotification(message, MessageType.Create, 10000, true, true);
		//		this.refreshInvoice(true, newId);
		//	}
		//});
	}

	updateInvoice(_invoice: InvoiceModel, withBack: boolean = false) {
		this.spinner.show();
		this.invoiceService.updateInvoice(_invoice).toPromise().then((res) => {
			this.spinner.hide();
			const resp = res as unknown as ApiResponse;
			if (resp.success) {
				
				const message = `Invoice successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 10000, true, true);
				this.loadInvoiceFromService(this.invoice.id);
			} else {
				const message = `An error occured while processing your request. Please try again later.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 10000, true, true);
			}
		}).catch((e) => {
			this.spinner.hide();
		});

		//this.loadingSubject.next(true);
		//const updateInvoice: Update<InvoiceModel> = {
		//	id: _invoice.id,
		//	changes: _invoice
		//};

		//this.store.dispatch(new InvoiceUpdated({
		//	partialInvoice: updateInvoice,
		//	invoice: _invoice
		//}));

		//of(undefined).pipe(delay(3000)).subscribe(() => { // Remove this line
		//	if (withBack) {
		//		this.goBack(_invoice.id);
		//	} else {
		//		const message = `Invoice successfully has been saved.`;
		//		this.layoutUtilsService.showActionNotification(message, MessageType.Update, 10000, true, true);
		//		this.refreshInvoice(false);
		//	}
		//}); 
	}

	getComponentTitle() {
		let result = 'Create invoice';
		if (!this.invoice || !this.invoice.id) {
			return result;
		}

		result = `Edit invoice - ${this.invoice.invoiceNumber} ${this.invoice.subject}`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}


	/*Fitlers Section*/
	loadStaticResources() {
		this.loadInvoiceEntitiesForFilter();
		this.loadCitiesForFilter();
		this.loadCountiesForFilter();

		this.staticService.getInvoiceStatusOptions().pipe(map(n => n.data as unknown as FilterModel[])).toPromise().then((data) => {
			this.invoiceStatusOptions = data;

			if (this.invoice.statusId) {
				var obj = data.find((e) => { return e.id == this.invoice.statusId });
				if (obj)
					this.invoiceForm.get('statusId').setValue(obj.id);
			}
		});

		this.staticService.getPaymentMethodsForFilter().pipe(map(n => n.data as unknown as FilterModel[])).toPromise().then((data) => {
			this.paymentMethodsOptions = data;

			if (this.invoice.paymentMethodId) {
				var obj = data.find((e) => { return e.id == this.invoice.paymentMethodId });
				if (obj)
					this.invoiceForm.get('paymentMethodId').setValue(obj.id);
			}
		});


		if (this.invoice.insuranceCoverId !== undefined) {
			this.invoiceForm.get('insuranceCoverId').setValue(this.invoice.insuranceCoverId.toString());
		}

		if (this.invoice.invoiceSentByEmailId !== undefined) {
			this.invoiceForm.get('invoiceSentByEmailId').setValue(this.invoice.invoiceSentByEmailId.toString());
		}

		if (this.invoice.invoiceSentByMailId !== undefined) {
			this.invoiceForm.get('invoiceSentByMailId').setValue(this.invoice.invoiceSentByMailId.toString());
		}

	}


	//// Invoice Entities
	loadInvoiceEntitiesForFilter() {
		this.staticService.getInvoiceEntitiesForFilter().subscribe(res => {
			this.invoiceEntitiesForFilter = res.data;

			this.filteredInvoiceEntities = this.invoiceForm.get('invoiceEntityId').valueChanges
				.pipe(
					startWith(''),
					map(value => this._filterInvoiceEntities(value))
				);
			if (this.invoice.invoiceEntityId > 0) {
				var ie = this.invoiceEntitiesForFilter.find(x => x.id == this.invoice.invoiceEntityId);
				if (ie) {
					this.invoiceForm.patchValue({ 'invoiceEntityId': { id: ie.id, value: ie.value } });
				}
			}
		});
	}
	private _filterInvoiceEntities(value: string): FilterModel[] {
		const filterValue = this._normalizeValue(value);
		return this.invoiceEntitiesForFilter.filter(title => this._normalizeValue(title.value).includes(filterValue));
	}

	
	// end Invoice Entities

	// cities
	loadCitiesForFilter() {
		this.staticService.getCitiesForFilter().subscribe(res => {
			this.citiesForFilter = res.data;

			this.filteredBillingCities = this.invoiceForm.get('ieBillingCityId').valueChanges
				.pipe(
					startWith(''),
					map(value => this._filterCities(value))
				);
			if (this.invoice.ieBillingCityId > 0) {
				var elem = this.citiesForFilter.find(x => x.id == this.invoice.ieBillingCityId);
				if (elem) {
					this.invoiceForm.patchValue({ 'ieBillingCityId': { id: elem.id, value: elem.value } });
				}
			}

			this.filteredMailingCities = this.invoiceForm.get('mailingCityId').valueChanges
				.pipe(
					startWith(''),
					map(value => this._filterCities(value))
				);
			if (this.invoice.mailingCityId > 0) {
				var elem = this.citiesForFilter.find(x => x.id == this.invoice.mailingCityId);
				if (elem) {
					this.invoiceForm.patchValue({ 'mailingCityId': { id: elem.id, value: elem.value } });
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

			this.filteredBillingCountries = this.invoiceForm.get('ieBillingCountryId').valueChanges
				.pipe(
					startWith(''),
					map(value => this._filterCountries(value))
				);
			if (this.invoice.ieBillingCountryId > 0) {
				var elem = this.countriesForFilter.find(x => x.id == this.invoice.ieBillingCountryId);
				if (elem) {
					this.invoiceForm.patchValue({ 'ieBillingCountryId': { id: elem.id, value: elem.value } });
				}
			}

			this.filteredMailingCountries = this.invoiceForm.get('mailingCountryId').valueChanges
				.pipe(
					startWith(''),
					map(value => this._filterCountries(value))
				);
			if (this.invoice.mailingCountryId > 0) {
				var elem = this.countriesForFilter.find(x => x.id == this.invoice.mailingCountryId);
				if (elem) {
					this.invoiceForm.patchValue({ 'mailingCountryId': { id: elem.id, value: elem.value } });
				}
			}
		});

	}
	private _filterCountries(value: string): FilterModel[] {
		const filterValue = this._normalizeValue(value);
		return this.countriesForFilter.filter(title => this._normalizeValue(title.value).includes(filterValue));
	}
	// end account code id filter


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
