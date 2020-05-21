// Angular
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
// Material
import { MatDialog, MAT_DATE_FORMATS, MatTabChangeEvent } from '@angular/material';
// RxJS
import { Observable, BehaviorSubject, Subscription, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../../core/reducers';
// Layout
import { SubheaderService, } from '../../../../../core/_base/layout';
// CRUD
import { LayoutUtilsService, MessageType } from '../../../../../core/_base/crud';
// Services and Models
import {
	InvoiceModel,
	InvoicesService,
	StaticDataModel,
	StaticDataService,
	FilterModel,
	ApiResponse
} from '../../../../../core/medelit';
import { NgxSpinnerService } from 'ngx-spinner';
import { MedelitBaseComponent } from '../../../../../core/_base/components/medelit-base.component';


@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-invoice-edit',
	templateUrl: './invoice-edit.component.html',
	styleUrls: ['./invoice-edit.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoiceEditComponent extends MedelitBaseComponent implements OnInit, OnDestroy {
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
	tabTitle: string = '';
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

	customersForFilter: FilterModel[] = [];
	filteredCustomers: Observable<FilterModel[]>;

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
		private invoiceFB: FormBuilder,
		public dialog: MatDialog,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private invoiceService: InvoicesService,
		private staticService: StaticDataService,
		private spinner: NgxSpinnerService,
		private cdr: ChangeDetectorRef) {
		super();
	}

	ngOnInit() {
		this.loading$ = this.loadingSubject.asObservable();
		this.loadingSubject.next(true);
		this.activatedRoute.params.subscribe(params => {
			const id = parseInt(params.id);
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
		this.detectChanges();

		this.loadStaticResources();
	}

	loadInvoiceFromService(invoiceId) {
		this.spinner.show();
		this.invoiceService.getInvoiceById(invoiceId).toPromise().then(res => {
			this.spinner.hide();
			let data = res as unknown as ApiResponse;
			this.loadInvoice(data.data, true);

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
			customerId: [this.invoice.customerId, [Validators.required]],
			subject: [this.invoice.subject, [Validators.required]],
			invoiceEntityId: [this.invoice.invoiceEntityId],
			patientDateOfBirth: [this.formatDate(this.invoice.patientDateOfBirth)],
			statusId: [this.invoice.statusId, [Validators.required]],
			dueDate: [this.formatDate(this.invoice.dueDate), [Validators.required]],
			invoiceDate: [this.formatDate(this.invoice.invoiceDate), [Validators.required]],
			invoiceDeliveryDate: [this.formatDate(this.invoice.invoiceDeliveryDate), [Validators.required]],
			invoiceSentByEmailId: [this.invoice.invoiceSentByEmailId.toString(), [Validators.required]],
			invoiceSentByMailId: [this.invoice.invoiceSentByMailId.toString(), [Validators.required]],
			// Billing Address
			ieBillingAddress: [this.invoice.ieBillingAddress, [Validators.required]],
			ieBillingPostCode: [this.invoice.ieBillingPostCode],
			ieBillingCity: [this.invoice.ieBillingCity],
			ieBillingCountryId: [this.invoice.ieBillingCountryId, [Validators.required]],

			// mailing address
			mailingAddress: [this.invoice.mailingAddress, [Validators.required]],
			mailingPostCode: [this.invoice.mailingPostCode],
			mailingCity: [this.invoice.mailingCity],
			mailingCountryId: [this.invoice.mailingCountryId, [Validators.required]],

			// payment and invoicing
			paymentArrivalDate: [this.formatDate(this.invoice.paymentArrivalDate), []],
			paymentDueDate: [this.formatDate(this.invoice.paymentDueDate), [Validators.required]],
			//discount: [this.invoice.discount],
			paymentMethodId: [this.invoice.paymentMethodId, [Validators.required]],
			insuranceCoverId: [this.invoice.insuranceCoverId],
			invoiceNotes: [this.invoice.invoiceNotes, []],
			invoiceDiagnosis: [this.invoice.invoiceDiagnosis],
			invoiceDescription: [this.invoice.invoiceDescription, []],
			termsAndConditions: [this.invoice.termsAndConditions, [Validators.required]],
			itemNameOnInvoice: [this.invoice.itemNameOnInvoice, [Validators.required]],

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
			window.scroll(0, 0);
			return;
		}

		let editedInvoice = this.prepareInvoice();
		if (editedInvoice.id > 0) {
			this.updateInvoice(editedInvoice, withBack);
			return;
		}

		//this.addInvoice(editedInvoice, withBack);
	}

	invoiceEmission() {
		this.hasFormErrors = false;
		const controls = this.invoiceForm.controls;
		/** check form */
		if (this.invoiceForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			window.scroll(0, 0);
			return;
		}

		let editedInvoice = this.prepareInvoice();

		this.spinner.show();
		this.invoiceService.updateInvoice(editedInvoice).toPromise().then((res) => {
			this.spinner.hide();
			const resp = res as unknown as ApiResponse;
			if (resp.success) {
				this.invoiceService.processInvoiceEmission(editedInvoice.id).toPromise().then((r) => {
					if (r.success) {
						const message = `Invoice emission processed successfully.`;
						this.layoutUtilsService.showActionNotification(message, MessageType.Update, 10000, true, true);
						this.loadInvoiceFromService(this.invoice.id);
					} else {
						const message = r.errors[0];
						this.layoutUtilsService.showActionNotification(message, MessageType.Update, 10000, true, true);
					}
				});
			} else {
				const message = `An error occured while processing your request. Please try again later.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 10000, true, true);
			}
		}).catch((e) => {
			this.spinner.hide();
		});

	}

	prepareInvoice(): InvoiceModel {
		const controls = this.invoiceForm.controls;
		const _invoice = new InvoiceModel();
		_invoice.id = this.invoice.id;
		_invoice.subject = controls.subject.value;
		_invoice.invoiceNumber = controls.invoiceNumber.value;
		if (controls.customerId.value)
			_invoice.customerId = +controls.customerId.value.id;
		_invoice.patientDateOfBirth = this.toDateFormat(controls.patientDateOfBirth.value);
		if (controls.invoiceEntityId.value)
			_invoice.invoiceEntityId = +controls.invoiceEntityId.value.id;
		_invoice.statusId = controls.statusId.value;
		_invoice.dueDate = this.toDateFormat(controls.dueDate.value);
		_invoice.invoiceDate = this.toDateFormat(controls.invoiceDate.value);
		_invoice.invoiceDeliveryDate = this.toDateFormat(controls.invoiceDeliveryDate.value);
		_invoice.invoiceSentByEmailId = +controls.invoiceSentByEmailId.value;
		_invoice.invoiceSentByMailId = +controls.invoiceSentByMailId.value;
		// billing address
		_invoice.ieBillingAddress = controls.ieBillingAddress.value;
		_invoice.ieBillingPostCode = controls.ieBillingPostCode.value;
		_invoice.ieBillingCity = controls.ieBillingCity.value;
		if (controls.ieBillingCountryId.value)
			_invoice.ieBillingCountryId = controls.ieBillingCountryId.value.id;
		// mailing addres
		_invoice.mailingAddress = controls.mailingAddress.value;
		_invoice.mailingPostCode = controls.mailingPostCode.value;
		_invoice.mailingCity = controls.mailingCity.value;
		if (controls.mailingCountryId.value)
			_invoice.mailingCountryId = controls.mailingCountryId.value.id;

		//payment and invoicing
		_invoice.paymentArrivalDate = this.toDateFormat(controls.paymentArrivalDate.value);
		_invoice.paymentDueDate = this.toDateFormat(controls.paymentDueDate.value);
		//_invoice.discount = controls.discount.value;
		_invoice.paymentMethodId = controls.paymentMethodId.value;
		_invoice.insuranceCoverId = controls.insuranceCoverId.value;
		_invoice.invoiceNotes = controls.invoiceNotes.value;
		_invoice.invoiceDiagnosis = controls.invoiceDiagnosis.value;
		_invoice.termsAndConditions = controls.termsAndConditions.value;
		_invoice.invoiceDescription = controls.invoiceDescription.value;
		_invoice.itemNameOnInvoice = controls.itemNameOnInvoice.value;

		return _invoice;
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


	}

	getComponentTitle() {

		let result = 'Create invoice';
		if (this.selectedTab == 0) {
			if (!this.invoice || !this.invoice.id) {
				return result;
			}
			result = `Edit invoice - ${this.invoice.invoiceNumber}`;
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
		this.loadCustomersForFilter();
		this.loadInvoiceEntitiesForFilter();
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

	// customers
	loadCustomersForFilter() {
		this.staticService.getCustomersForFilter().subscribe(res => {
			this.customersForFilter = res.data;

			this.filteredCustomers = this.invoiceForm.get('customerId').valueChanges
				.pipe(
					startWith(''),
					map(value => this._filterCustomers(value))
				);
			if (this.invoice.customerId > 0) {
				var elem = this.customersForFilter.find(x => x.id == this.invoice.customerId);
				if (elem) {
					this.invoiceForm.patchValue({ 'customerId': { id: elem.id, value: elem.value } });
				}
			}

		});

	}
	private _filterCustomers(value: string): FilterModel[] {
		const filterValue = this._normalizeValue(value);
		return this.customersForFilter.filter(title => this._normalizeValue(title.value).includes(filterValue));
	}
	// end clinic cities


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

	tabChanged(event: MatTabChangeEvent) {
		this.tabTitle = event.tab.textLabel;
	}

	/*Start closed events */

	controlFocusout(control) {
		const val = this.invoiceForm.get(control).value;
		if (val && val.id) return;
		this.invoiceForm.get(control).setValue('');
		this.cdr.markForCheck();
	}

	/*End Closed events */

	detectChanges() {
		try {
			this.cdr.detectChanges();
		} catch (e) {
		}
	}

}
