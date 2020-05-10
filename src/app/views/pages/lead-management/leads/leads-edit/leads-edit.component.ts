// Angular
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
// Material
import { MatDialog, MAT_DATE_LOCALE } from '@angular/material';
// RxJS
import { Observable, BehaviorSubject, Subscription, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../../core/reducers';
// Layout
import { SubheaderService } from '../../../../../core/_base/layout';
// CRUD
import { LayoutUtilsService, MessageType } from '../../../../../core/_base/crud';
// Services and Models
import {
	LeadModel,
	LeadsService,
	StaticDataModel,

	StaticDataService,
	FilterModel,
	ApiResponse,
	LeadServicesModel,

	MedelitStaticData,
	InvoiceEntityModel
} from '../../../../../core/medelit';
import { NgxSpinnerService } from 'ngx-spinner';
import { TranslateService } from '@ngx-translate/core';
import { CreateInvoiceEntityDialogComponent } from '../../../../partials/create-invoice-entity/create-invoice-entity.dialog.component';
import { AlertDialogComponent } from '../../../../partials/alert-dialog/alert-dialog.component';
import { MedelitConstants } from '../../../../../core/_base/constants/medelit-contstants';
import { MedelitBaseComponent } from '../../../../../core/_base/components/medelit-base.component';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-lead-edit',
	templateUrl: './leads-edit.component.html',
	styleUrls: ['./leads-edit.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeadEditComponent extends MedelitBaseComponent implements OnInit, OnDestroy {

	// Public properties
	fromCustomerId: number;
	lead: LeadModel;
	leadId$: Observable<number>;
	leadId: number;
	titles: Observable<StaticDataModel>;
	languages: Observable<StaticDataModel>;
	countries: Observable<StaticDataModel>;
	cities: Observable<StaticDataModel>;
	relationaships: Observable<StaticDataModel>;
	services: Observable<StaticDataModel>;
	oldLead: LeadModel;
	selectedTab = 0;
	loadingSubject = new BehaviorSubject<boolean>(true);
	loading$: Observable<boolean>;
	leadForm: FormGroup;
	hasFormErrors = false;
	availableYears: number[] = [];
	filteredColors: Observable<string[]>;
	filteredManufactures: Observable<string[]>;
	// Private password
	private componentSubscriptions: Subscription;
	// sticky portlet header margin
	private headerMargin: number;
	fromCustomer = new FormControl(0);
	searchCtrl = new FormControl();

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

	professionalsForFilter: FilterModel[] = [];
	filteredProfessionals: Observable<FilterModel[]>;

	paymentMethodsOptions: FilterModel[];
	listedDiscountNetworkOptions: FilterModel[];
	buildingTypeOptions: FilterModel[];
	visitVenueOptions: FilterModel[];
	leadStatusOptions: FilterModel[];
	leadSourceOptions: FilterModel[];
	contactMethodOptions: FilterModel[];
	leadCategoryOptions: FilterModel[];

	invoiceEntitiesForFilter: FilterModel[] = [];
	filteredInvoiceEntities: Observable<FilterModel[]>;

	citiesForFilter: FilterModel[] = [];
	filteredCities: Observable<FilterModel[]>;

	countriesForFilter: FilterModel[] = [];
	filteredCountries: Observable<FilterModel[]>;

	constructor(
		private store: Store<AppState>,
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private leadFB: FormBuilder,
		public dialog: MatDialog,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private leadService: LeadsService,
		private staticService: StaticDataService,
		private spinner: NgxSpinnerService,
		private translate: TranslateService,
		private cdr: ChangeDetectorRef) {
		super();
	}

	ngOnInit() {

		//this.loading$ = this.loadingSubject.asObservable();
		//this.loadingSubject.next(true);

		this.activatedRoute.queryParams.subscribe((param) => {
			const fromCustomerId = parseInt(param.fromCustomer);

			this.activatedRoute.params.subscribe(params => {
				const id = parseInt(params.id);
				if (id && id > 0) {
					this.leadId = +id;
					//this.store.pipe(
					//	select(selectLeadById(id))
					//).subscribe(result => {
					//	if (!result) {
					//		this.loadLeadFromService(id);
					//		return;
					//	}

					//	this.loadLead(result);
					//});
					this.loadLeadFromService(id, fromCustomerId);
				} else if (fromCustomerId) {
					this.loadLeadFromService(0, fromCustomerId);
				}
				else {
					const newLead = new LeadModel();
					newLead.clear();
					this.loadLead(newLead);
				}
			});

		});

		// sticky portlet header
		window.onload = () => {
			const style = getComputedStyle(document.getElementById('kt_header'));
			this.headerMargin = parseInt(style.height, 0);
		};
	}

	loadLead(_lead, fromService: boolean = false) {
		if (!_lead) {
			this.goBack('');
		}
		this.lead = _lead;
		this.leadId$ = of(_lead.id);
		this.oldLead = Object.assign({}, _lead);
		this.initLead();

		this.loadStaticResources();

		if (fromService) {
			this.cdr.detectChanges();
		}
	}

	loadLeadFromService(leadId, fromCustomerId?: number) {
		this.spinner.show();
		this.leadService.getLeadById(leadId, fromCustomerId).toPromise().then(res => {
			let data = res as unknown as ApiResponse;
			this.loadLead(data.data, true);
		}).catch((e) => {
			this.spinner.hide();
		}).finally(() => {
			//this.spinner.hide();
		});
	}

	ngOnDestroy() {
		if (this.componentSubscriptions) {
			this.componentSubscriptions.unsubscribe();
		}
	}

	initLead() {
		this.createForm();
		this.loadingSubject.next(false);
		if (!this.lead.id) {
			this.subheaderService.setBreadcrumbs([
				{ title: 'lead-management', page: `/leads` },
				{ title: 'Leads', page: `/lead-management/leads` },
				{ title: 'Create lead', page: `/lead-management/leads/add` }
			]);
			return;
		}
		this.subheaderService.setTitle('Leads');

		this.subheaderService.setBreadcrumbs([
			{ title: 'lead-management', page: `/leads` },
			{ title: 'Leads', page: `/lead-management/leads` },
			{ title: 'Edit lead', page: `/lead-management/leads/edit`, queryParams: { id: this.lead.id } }
		]);

	}

	createForm() {
		this.leadForm = this.leadFB.group({
			fromCustomerId: [this.lead.fromCustomerId, []],
			titleId: [this.lead.titleId, Validators.required],
			surName: [this.lead.surName, [Validators.required, Validators.min(4)]],
			name: [this.lead.name],
			languageId: [this.lead.languageId, [Validators.required]],
			mainPhone: [this.lead.mainPhone, [Validators.pattern(MedelitConstants.mobnumPattern)]],
			mainPhoneOwner: [this.lead.mainPhoneOwner],
			contactPhone: [this.lead.contactPhone, [Validators.pattern(MedelitConstants.mobnumPattern)]],
			phone2: [this.lead.phone2, [Validators.pattern(MedelitConstants.mobnumPattern)]],
			phone2Owner: [this.lead.phone2Owner, []],
			phone3: [this.lead.phone3, [Validators.pattern(MedelitConstants.mobnumPattern)]],
			phone3Owner: [this.lead.phone3Owner, []],
			email: [this.lead.email, [Validators.email,]],
			email2: [this.lead.email2, [Validators.email,]],
			fax: [this.lead.fax, []],
			dateOfBirth: [this.formatDate(this.lead.dateOfBirth), []],
			countryOfBirthId: [this.lead.countryOfBirthId, []],
			visitRequestingPerson: [this.lead.visitRequestingPerson, []],
			visitRequestingPersonRelationId: [this.lead.visitRequestingPersonRelationId, []],
			gpCode: [this.lead.gpCode, []],

			services: this.leadFB.array([]),

			preferredPaymentMethodId: [this.lead.preferredPaymentMethodId, []],
			insuranceCoverId: [this.lead.insuranceCoverId, []],
			listedDiscountNetworkId: [this.lead.listedDiscountNetworkId, []],
			discount: [this.lead.discount, []],
			haveDifferentIEId: [this.lead.haveDifferentIEId, []],
			invoiceEntityId: [this.lead.invoiceEntityId, [Validators.required]],
			invoicingNotes: [this.lead.invoicingNotes, []],
			// address info
			addressStreetName: [this.lead.addressStreetName, [Validators.required]],
			postalCode: [this.lead.postalCode, [Validators.required]],
			city: [this.lead.city, [Validators.required]],
			countryId: [this.lead.countryId, [Validators.required]],
			buildingTypeId: [this.lead.buildingTypeId, []],
			buzzer: [this.lead.buzzer, []],
			flatNumber: [this.lead.flatNumber, []],
			floor: [this.lead.floor, []],
			visitVenueId: [this.lead.visitVenueId, []],
			addressNotes: [this.lead.addressNotes, []],
			visitVenueDetail: [this.lead.visitVenueDetail, []],

			// Lead Information
			leadStatusId: [this.lead.leadStatusId, []],
			leadSourceId: [this.lead.leadSourceId, []],
			leadCategoryId: [this.lead.leadCategoryId, []],
			contactMethodId: [this.lead.contactMethodId, []],
			leadDescription: [this.lead.leadDescription, [Validators.required]],

			// bank info
			bankName: [this.lead.bankName, []],
			accountNumber: [this.lead.accountNumber, []],
			sortCode: [this.lead.sortCode, []],
			iban: [this.lead.iban, []],
			blacklistId: [this.lead.blacklistId.toString(), []],

		});
		this.initServicesForm();

	}

	initServicesForm() {

		if (this.lead.services.length > 0) {

			this.lead.services.forEach((service) => {
				const group = this.leadFB.group({
					id: [service.id, []],
					serviceId: [service.serviceId, [Validators.required]],
					serviceSearchCtrl: [''],
					professionalId: [service.professionalId, [Validators.required]],
					professionalSearchCtrl: [''],
					ptFeeId: [service.ptFeeId, [Validators.required]],
					isPtFeeA1: [service.isPtFeeA1, [Validators.required]],

					ptFeeA1: [parseFloat(service.ptFeeA1).toFixed(2), [Validators.required]],
					ptFeeA2: [parseFloat(service.ptFeeA2).toFixed(2), [Validators.required]],
					proFeeId: [service.proFeeId, [Validators.required]],
					isProFeeA1: [service.isProFeeA1, [Validators.required]],

					proFeeA1: [parseFloat(service.proFeeA1).toFixed(2), [Validators.required]],
					proFeeA2: [parseFloat(service.proFeeA2).toFixed(2), [Validators.required]],
				});
				(<FormArray>this.leadForm.get('services')).push(group);
			});

		} else {
			this.addService();
		}
	}

	addService() {

		var newModel = new LeadServicesModel();
		newModel.id = null;
		newModel.serviceId = null;
		newModel.professionalId = null;
		//this.lead.services.push(newModel);

		const group = this.leadFB.group({
			id: [null, []],
			serviceId: [null, [Validators.required]],
			professionalId: [null, [Validators.required]],
			ptFeeId: [null, [Validators.required]],
			isPtFeeA1: ['1', [Validators.required]],
			ptFeeA1: [null, [Validators.required]],
			ptFeeA2: [null, [Validators.required]],
			proFeeId: [null, [Validators.required]],
			isProFeeA1: ['1', [Validators.required]],
			proFeeA1: [null, [Validators.required]],
			proFeeA2: [null, [Validators.required]],
		});
		(<FormArray>this.leadForm.get('services')).push(group);
		//this.selected.setValue(this.lead.services.length - 1);
	}

	get feesSubTotals() {
		let ptFeeSubTotal = 0;
		let proFeeSubTotal = 0;

		if (!this.leadForm) return;
		const control = <FormArray>this.leadForm.controls['services'];
		for (let i = 0; i < control.length; i++) {
			if (control.controls[i].get('isPtFeeA1').value === '1')
				ptFeeSubTotal += +control.controls[i].get('ptFeeA1').value;
			else
				ptFeeSubTotal += +control.controls[i].get('ptFeeA2').value;

			if (control.controls[i].get('isProFeeA1').value === '1')
				proFeeSubTotal += +control.controls[i].get('proFeeA1').value;
			else
				proFeeSubTotal += +control.controls[i].get('proFeeA2').value;
		}

		return { ptFeeSubTotal: ptFeeSubTotal, proFeeSubTotal: proFeeSubTotal };
	}

	removeService(index) {
		if (index > 0) {
			this.lead.services.splice(index, 1);
			const control = <FormArray>this.leadForm.controls['services'];
			for (let i = control.length - 1; i >= 0; i--) {
				if (i === index)
					control.removeAt(i)
			}
			//this.initServicesForm();
			//this.loadServicesForFilter();
		}
	}

	goBack(id) {
		this.loadingSubject.next(false);
		const url = `/lead-management/leads?id=${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	goBackWithoutId() {
		this.router.navigateByUrl('/lead-management/leads', { relativeTo: this.activatedRoute });
	}

	refreshLead(isNew: boolean = false, id = 0) {
		this.loadingSubject.next(false);
		let url = this.router.url;
		//if (!isNew) {
		//	this.router.navigate([url], { relativeTo: this.activatedRoute });
		//	return;
		//}

		url = `/lead-management/leads/edit/${id}`;
		this.router.navigate([url]);
		//this.router.navigate([url], { relativeTo: this.activatedRoute });
	}

	reset() {
		this.lead = Object.assign({}, this.oldLead);
		//this.createForm();
		this.loadLead(this.lead);
		this.hasFormErrors = false;
		this.leadForm.markAsPristine();
		this.leadForm.markAsUntouched();
		this.leadForm.updateValueAndValidity();
	}

	onSumbit(withBack: boolean = false, withBooking: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.leadForm.controls;
		/** check form */
		if (this.leadForm.invalid) {
			Object.keys(controls).forEach(controlName => {
				if (controls[controlName].status === 'INVALID')
					console.log('invlaid controls', controlName);
			});

			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);
			(<FormArray>this.leadForm.get('services')).controls.forEach((group: FormGroup) => {
				const scontrols = group.controls;

				(<any>Object).keys(scontrols).forEach((controlName) => {
					scontrols[controlName].markAsTouched()
					if (scontrols[controlName].status === 'INVALID')
						console.log('invlaid service controls', controlName);
				});



				//(<any>Object).values(group.controls).forEach((control: FormControl) => {
				//	control.markAsTouched();
				//	if (control.status === 'INVALID')
				//		console.log('invlaid controls', control);
				//});
			});

			this.hasFormErrors = true;
			this.selectedTab = 0;
			window.scroll(0, 0);

			return;
		}
		if (withBooking) {
			let name = this.leadForm.get('name').value;
			let email = this.leadForm.get('email').value;
			let leadSource = this.leadForm.get('leadSourceId').value;
			let dateOfBirth = this.leadForm.get('dateOfBirth').value;
			let addressStreetName = this.leadForm.get('addressStreetName').value;
			let postalCode = this.leadForm.get('postalCode').value;
			let city = this.leadForm.get('city').value;
			let visitVenueId = this.leadForm.get('visitVenueId').value;
			let contactMethodId = this.leadForm.get('contactMethodId').value;
			let buildingTypeId = this.leadForm.get('buildingTypeId').value;
			let paymentMethodId = this.leadForm.get('preferredPaymentMethodId').value;
			let insuranceCoverId = this.leadForm.get('insuranceCoverId').value;

			let message = '';
			if (!name)
				message += '<span class="font-500">Name</span> is required. <br/>';
			if (!email)
				message += '<span class="font-500">Email</span> is required. <br/>';
			if (!leadSource)
				message += '<span class="font-500">Lead source</span> is required. <br/>';
			if (!dateOfBirth)
				message += '<span class="font-500">Date of birth</span> is required. <br/>';
			if (!addressStreetName)
				message += '<span class="font-500">Street name</span> is required. <br/>';
			if (!postalCode)
				message += '<span class="font-500">Postal code</span> is required. <br/>';
			if (!city)
				message += '<span class="font-500">City</span> is required. <br/>';
			if (!visitVenueId)
				message += '<span class="font-500">Visit Venue</span> is required. <br/>';

			if (!contactMethodId)
				message += '<span class="font-500">Contact Method</span> is required. <br/>';
			if (!buildingTypeId)
				message += '<span class="font-500">Building Type</span> is required. <br/>';
			if (!paymentMethodId)
				message += '<span class="font-500">Payment Method</span> is required. <br/>';
			if (!insuranceCoverId)
				message += '<span class="font-500">Insurance Cover</span> is required. <br/>';


			if (message) {
				const dialogRef = this.dialog.open(AlertDialogComponent, {
					width: '300px',
					data: { title: 'Missing fields', message: '<strong>Following fields are required to convert lead to booking: </strong><br/>' + message }
				});

				dialogRef.afterClosed().subscribe(result => { });

				return;
			}
		}


		// tslint:disable-next-line:prefer-const
		let editedLead = this.prepareLead();

		if (editedLead.id > 0) {
			this.updateLead(editedLead, withBack, withBooking);
			return;
		}

		this.addLead(editedLead, withBack);
	}

	prepareLead(): LeadModel {
		const controls = this.leadForm.controls;
		const _lead = new LeadModel();
		_lead.id = this.lead.id;
		if (controls.fromCustomerId.value)
			_lead.fromCustomerId = +controls.fromCustomerId.value;
		_lead.titleId = +controls.titleId.value;
		_lead.surName = controls.surName.value;
		_lead.name = controls.name.value;
		if (controls.languageId.value)
			_lead.languageId = +controls.languageId.value.id;
		_lead.mainPhone = controls.mainPhone.value;
		_lead.mainPhoneOwner = controls.mainPhoneOwner.value;
		_lead.contactPhone = controls.contactPhone.value;
		_lead.phone2 = controls.phone2.value;
		_lead.phone2Owner = controls.phone2Owner.value;
		_lead.phone3 = controls.phone3.value;
		_lead.phone3Owner = controls.phone3Owner.value;
		_lead.email = controls.email.value;
		_lead.email2 = controls.email2.value;
		_lead.fax = controls.fax.value;
		_lead.dateOfBirth = this.toDateFormat(controls.dateOfBirth.value);
		if (controls.countryOfBirthId.value)
			_lead.countryOfBirthId = controls.countryOfBirthId.value.id;
		_lead.visitRequestingPerson = controls.visitRequestingPerson.value;
		if (controls.visitRequestingPersonRelationId.value)
			_lead.visitRequestingPersonRelationId = controls.visitRequestingPersonRelationId.value.id;
		_lead.gpCode = controls.gpCode.value;

		_lead.preferredPaymentMethodId = controls.preferredPaymentMethodId.value;
		_lead.insuranceCoverId = controls.insuranceCoverId.value;
		_lead.listedDiscountNetworkId = controls.listedDiscountNetworkId.value;
		_lead.discount = controls.discount.value;
		_lead.haveDifferentIEId = +controls.haveDifferentIEId.value;
		if (controls.invoiceEntityId.value)
			_lead.invoiceEntityId = controls.invoiceEntityId.value.id;
		_lead.invoicingNotes = controls.invoicingNotes.value;
		_lead.visitRequestingPersonRelationId = controls.visitRequestingPersonRelationId.value;

		// address info
		_lead.addressStreetName = controls.addressStreetName.value;
		_lead.postalCode = controls.postalCode.value;
		_lead.city = controls.city.value;
		if (controls.countryId.value)
			_lead.countryId = controls.countryId.value.id;
		_lead.buildingTypeId = controls.buildingTypeId.value;
		_lead.buzzer = controls.buzzer.value;
		_lead.flatNumber = controls.flatNumber.value;
		_lead.floor = controls.floor.value;
		_lead.visitVenueId = controls.visitVenueId.value;
		_lead.addressNotes = controls.addressNotes.value;
		_lead.visitVenueDetail = controls.visitVenueDetail.value;


		// lead info
		_lead.leadStatusId = controls.leadStatusId.value;
		_lead.leadSourceId = controls.leadSourceId.value;
		_lead.leadCategoryId = controls.leadCategoryId.value;
		_lead.contactMethodId = controls.contactMethodId.value;
		_lead.leadDescription = controls.leadDescription.value;

		// bank info
		_lead.bankName = controls.bankName.value;
		_lead.accountNumber = controls.accountNumber.value;
		_lead.sortCode = controls.sortCode.value;
		_lead.iban = controls.iban.value;
		_lead.blacklistId = +controls.blacklistId.value;
		_lead.services = [];

		const control = <FormArray>this.leadForm.controls['services'];
		for (let i = 0; i < control.length; i++) {
			var s = new LeadServicesModel();
			if (control.controls[i].get('serviceId').value)
				s.serviceId = +control.controls[i].get('serviceId').value.id;

			if (control.controls[i].get('professionalId').value)
				s.professionalId = +control.controls[i].get('professionalId').value;

			s.ptFeeId = +control.controls[i].get('ptFeeId').value
			s.isPtFeeA1 = +control.controls[i].get('isPtFeeA1').value
			s.ptFeeA1 = control.controls[i].get('ptFeeA1').value
			s.ptFeeA2 = control.controls[i].get('ptFeeA2').value

			s.proFeeId = +control.controls[i].get('proFeeId').value
			s.isProFeeA1 = +control.controls[i].get('isProFeeA1').value
			s.proFeeA1 = control.controls[i].get('proFeeA1').value
			s.proFeeA2 = control.controls[i].get('proFeeA2').value

			_lead.services.push(s);
		}
		return _lead;
	}

	addLead(_lead: LeadModel, withBack: boolean = false) {
		this.spinner.show();
		this.leadService.createLead(_lead).toPromise().then((res) => {
			this.spinner.hide();
			const resp = res as unknown as ApiResponse;
			if (resp.success && resp.data > 0) {
				const message = `New lead successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 10000, true, true);
				this.refreshLead(true, resp.data);
			} else {
				const message = `An error occured while processing your request. Please try again later.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 10000, true, true);
			}
		}).catch((e) => {
			this.spinner.hide();
		});



		//this.store.dispatch(new LeadOnServerCreated({ lead: _lead }));
		//this.componentSubscriptions = this.store.pipe(
		//	delay(1000),
		//	select(selectLastCreatedLeadId)
		//).subscribe(newId => {
		//	if (!newId) {
		//		return;
		//	}

		//	this.loadingSubject.next(false);
		//	if (withBack) {
		//		this.goBack(newId);
		//	} else {
		//		const message = `New lead successfully has been added.`;
		//		this.layoutUtilsService.showActionNotification(message, MessageType.Create, 10000, true, true);
		//		this.refreshLead(true, newId);
		//	}
		//});
	}

	updateLead(_lead: LeadModel, withBack: boolean = false, withBooking: boolean = false) {
		this.spinner.show();
		this.leadService.updateLead(_lead).toPromise().then((res) => {

			const resp = res as unknown as ApiResponse;
			if (resp.success && resp.data > 0) {
				if (withBooking) {
					this.convertToBooking();
					return;
				}
				this.spinner.hide();
				const _lead = resp.data as unknown as LeadModel;

				const message = `Lead successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 10000, true, true);
				this.refreshLead(false, resp.data);
			} else {
				const message = `An error occured while processing your request. Please try again later.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 10000, true, true);
			}
		}).catch((e) => {
			this.spinner.hide();
		});
	}

	getComponentTitle() {
		let result = 'Create lead';
		if (!this.lead || !this.lead.id) {
			return result;
		}

		result = `Edit lead - ${this.lead.surName}`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

	convertToBooking() {
		this.leadService.convertToBooking(this.lead.id).toPromise().then((res) => {
			if (parseInt(res.data) > 0) {
				const message = `Booking created successfully.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 10000, true, true);

				const url = `/booking-management/bookings/edit/${res.data}`;
				this.router.navigate([url]);
			}
		}).catch((e) => {
			this.spinner.hide();
			const message = `An error occured. Please try again later.`;
			this.layoutUtilsService.showActionNotification(message, MessageType.Create, 10000, true, true);
		}).finally(() => {
			this.spinner.hide();
		});
	}

	/*Fitlers Section*/
	loadStaticResources() {
		this.loadCustomerForImport();
		this.loadLanguagesForFilter();
		this.loadCountriesForCountryOfBirthFilter();
		this.subscribeInvoiceEntity();
		this.loadCountiesForFilter();
		this.loadServicesForFilter();
		this.loadProfessionalsForFilter(1);

		this.staticService.getStaticDataForFitler().pipe(map(n => n.data as unknown as MedelitStaticData[])).toPromise().then((data) => {
			this.titlesForFilter = data.map((el) => { return { id: el.id, value: el.titles }; }).filter((e) => { if (e.value && e.value.length > 0) return e; });
			if (this.lead.titleId) {
				var obj = data.find((e) => { return e.id == this.lead.titleId });
				if (obj)
					this.leadForm.get('titleId').setValue(obj.id);
			}

			// payment methods
			this.paymentMethodsOptions = data.map((el) => { return { id: el.id, value: el.paymentMethods }; }).filter((e) => { if (e.value && e.value.length > 0) return e; });
			if (this.lead.preferredPaymentMethodId) {
				var obj = data.find((e) => { return e.id == this.lead.preferredPaymentMethodId });
				if (obj)
					this.leadForm.get('preferredPaymentMethodId').setValue(obj.id);
			}

			// discount networks
			this.listedDiscountNetworkOptions = data.map((el) => { return { id: el.id, value: el.discountNetworks }; }).filter((e) => { if (e.value && e.value.length > 0) return e; });
			if (this.lead.listedDiscountNetworkId) {
				var obj = data.find((e) => { return e.id == this.lead.listedDiscountNetworkId });
				if (obj)
					this.leadForm.get('listedDiscountNetworkId').setValue(obj.id);
			}
			// building types
			this.buildingTypeOptions = data.map((el) => { return { id: el.id, value: el.buildingTypes }; }).filter((e) => { if (e.value && e.value.length > 0) return e; });

			if (this.lead.buildingTypeId) {
				var obj = data.find((e) => { return e.id == this.lead.buildingTypeId });
				if (obj)
					this.leadForm.get('buildingTypeId').setValue(obj.id);
			}

			/// visit venues
			this.visitVenueOptions = data.map((el) => { return { id: el.id, value: el.visitVenues }; }).filter((e) => { if (e.value && e.value.length > 0) return e; });

			if (this.lead.visitVenueId) {
				const obj = data.find((e) => { return e.id == this.lead.visitVenueId });
				if (obj)
					this.leadForm.get('visitVenueId').setValue(obj.id);
			}

			// lead status
			this.leadStatusOptions = data.map((el) => { return { id: el.id, value: el.leadStatus }; }).filter((e) => { if (e.value && e.value.length > 0) return e; });

			if (this.lead.leadStatusId) {
				const obj = data.find((e) => { return e.id == this.lead.leadStatusId });
				if (obj)
					this.leadForm.get('leadStatusId').setValue(obj.id);
			}

			// lead sources
			this.leadSourceOptions = data.map((el) => { return { id: el.id, value: el.leadSources }; }).filter((e) => { if (e.value && e.value.length > 0) return e; });

			if (this.lead.leadSourceId) {
				const obj = data.find((e) => { return e.id == this.lead.leadSourceId });
				if (obj)
					this.leadForm.get('leadSourceId').setValue(obj.id);
			}

			// contact methods
			this.contactMethodOptions = data.map((el) => { return { id: el.id, value: el.contactMethods }; }).filter((e) => { if (e.value && e.value.length > 0) return e; });

			if (this.lead.contactMethodId) {
				const obj = data.find((e) => { return e.id == this.lead.contactMethodId });
				if (obj)
					this.leadForm.get('contactMethodId').setValue(obj.id);
			}

			// lead categories
			this.leadCategoryOptions = data.map((el) => { return { id: el.id, value: el.leadCategories }; }).filter((e) => { if (e.value && e.value.length > 0) return e; });;

			if (this.lead.leadCategoryId) {
				const obj = data.find((e) => { return e.id == this.lead.leadCategoryId });
				if (obj)
					this.leadForm.get('leadCategoryId').setValue(obj.id);
			}

			// relationships
			this.relationshipsForFilter = data.map((el) => { return { id: el.id, value: el.relationships }; }).filter((e) => { if (e.value && e.value.length > 0) return e; });

			if (this.lead.visitRequestingPersonRelationId) {
				const obj = data.find((e) => { return e.id == this.lead.visitRequestingPersonRelationId });
				if (obj)
					this.leadForm.get('visitRequestingPersonRelationId').setValue(obj.id);
			}

		});

		if (this.lead.insuranceCoverId) {
			this.leadForm.get('insuranceCoverId').setValue(this.lead.insuranceCoverId.toString());
		}
		if (this.lead.haveDifferentIEId !== null) {
			this.leadForm.get('haveDifferentIEId').setValue(this.lead.haveDifferentIEId.toString());
		}
	}

	// Customer
	loadCustomerForImport() {
		this.staticService.getCustomersForImportFilter().subscribe(res => {
			this.customersForFilter = res.data;

			this.filteredCustomers = this.leadForm.get('fromCustomerId').valueChanges
				.pipe(
					startWith(''),
					map(value => this._filterCustomers(value))
				);
			if (this.lead.customerId > 0) {
				var title = this.customersForFilter.find(x => x.id == this.lead.titleId);
				if (title) {
					this.leadForm.patchValue({ 'fromCustomerId': { id: title.id, value: title.value } });
				}
			}
		});

	}

	private _filterCustomers(value: string): FilterModel[] {
		const filterValue = this._normalizeValue(value);
		return this.customersForFilter.filter(title => this._normalizeValue(title.value).includes(filterValue));
	}

	importFromCustomer() {
		var fromCustomer = this.leadForm.get('fromCustomerId').value;
		if (fromCustomer) {
			if (this.lead.id > 0) {
				this.router.navigate([`/lead-management/leads/edit/${this.lead.id}`], { queryParams: { fromCustomer: fromCustomer.id }, queryParamsHandling: 'merge' });
			} else {
				this.router.navigate([`/lead-management/leads/add`], { queryParams: { fromCustomer: fromCustomer.id }, queryParamsHandling: 'merge' });
			}
		}
	}

	clearCustomer() {
		if (this.lead.id > 0) {
			this.router.navigate([`/lead-management/leads/edit/${this.lead.id}`]);
		} else {
			this.router.navigate([`/lead-management/leads/add`]);
		}
	}

	//// Customers

	//// Languages
	loadLanguagesForFilter() {
		this.staticService.getLanguagesForFilter().subscribe(res => {
			this.languagesForFilter = res.data;

			this.filteredLanguages = this.leadForm.get('languageId').valueChanges
				.pipe(
					startWith(''),
					map(value => this._filterLanguages(value))
				);
			if (this.lead.languageId > 0) {
				var title = this.languagesForFilter.find(x => x.id == this.lead.languageId);
				if (title) {
					this.leadForm.patchValue({ 'languageId': { id: title.id, value: title.value } });
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

			this.filteredCountriesForCountryOfBirth = this.leadForm.get('countryOfBirthId').valueChanges
				.pipe(
					startWith(''),
					map(value => this.filteredCountryOfBirth(value))
				);
			if (this.lead.countryOfBirthId > 0) {
				var title = this.countriesForCountryOfBirthForFilter.find(x => x.id == this.lead.countryOfBirthId);
				if (title) {
					this.leadForm.patchValue({ 'countryOfBirthId': { id: title.id, value: title.value } });
				}
			}
		});

	}
	private filteredCountryOfBirth(value: string): FilterModel[] {
		const filterValue = this._normalizeValue(value);
		return this.countriesForCountryOfBirthForFilter.filter(title => this._normalizeValue(title.value).includes(filterValue));
	}
	// end Country of Birth


	//// services
	loadServicesForFilter() {
		this.spinner.show();
		this.staticService.getServicesForFilter().toPromise().then(res => {
			this.servicesForFilter = res.data;

			const control = <FormArray>this.leadForm.controls['services'];
			for (let i = 0; i < control.length; i++) {
				const sControl = control.controls[i].get('serviceId');

				const serviceObj = sControl.value;
				if (serviceObj) {
					const sobj = this.servicesForFilter.filter((ele) => {
						return ele.id == serviceObj;
					});
					if (sobj) {
						control.controls[i].patchValue({ 'serviceId': sobj[0] });
						//	this.loadProfessionalsForFilter(sobj[0].id);
					}
				}

				var isPtFeeA1 = control.controls[i].get('isPtFeeA1').value;
				var isProFeeA1 = control.controls[i].get('isProFeeA1').value;
				if (isPtFeeA1 != undefined || isPtFeeA1 != null)
					control.controls[i].patchValue({ 'isPtFeeA1': isPtFeeA1.toString() });

				if (isProFeeA1 != undefined || isProFeeA1 != null)
					control.controls[i].patchValue({ 'isProFeeA1': isProFeeA1.toString() });

				control.controls[i].get('isPtFeeA1').valueChanges.subscribe((r) => {
					if (r === '1') {
						control.controls[i].get('ptFeeA1').enable();
						control.controls[i].get('ptFeeA2').disable();
					}
					else {
						control.controls[i].get('ptFeeA1').disable();
						control.controls[i].get('ptFeeA2').enable();
					}
				});

				control.controls[i].get('isProFeeA1').valueChanges.subscribe((r) => {
					if (r === '1') {
						control.controls[i].get('proFeeA1').enable();
						control.controls[i].get('proFeeA2').disable();
					}
					else {
						control.controls[i].get('proFeeA1').disable();
						control.controls[i].get('proFeeA2').enable();
					}
				});
			}
		}).catch((e) => {
			this.spinner.hide();
		}).finally(() => {
			this.spinner.hide();
		});
	}

	private _filterServices(value: string): FilterModel[] {
		const filterValue = this._normalizeValue(value);
		return this.servicesForFilter.filter(title => this._normalizeValue(title.value).includes(filterValue));
	}

	getFilteredServices(index) {
		// @ts-ignore
		var serviceControls = this.leadForm.get('services').controls[index];
		const val = serviceControls.get('serviceId').value;

		return this._filterServices(val);
	}


	serviceDrpClosed() {

	}

	getProfessionals(index: number) {
		// @ts-ignore:
		var serviceControls = this.leadForm.get('services').controls[index];
		//serviceControls.get('professionalId').setValue('');


		if (serviceControls.get('serviceId').value) {

			var serviceId = serviceControls.get('serviceId').value.id;
			return this.professionalsForFilter.filter((el) => {
				var elm = el as unknown as any;
				return elm.sid === serviceId
			});

		}
	}

	setFees(index) {
		// @ts-ignore:
		var serviceControls = this.leadForm.get('services').controls[index];

		if (serviceControls.get('professionalId').value) {

			const sid = serviceControls.get('serviceId').value.id;
			var proId = serviceControls.get('professionalId').value;
			if (!proId)
				return;
			// @ts-ignore
			const proData = this.professionalsForFilter.find((el) => el.id == proId && el.sid === sid);
			const ptFee = proData.ptFees;
			const proFee = proData.proFees;

			if (ptFee) {
				serviceControls.get('ptFeeId').setValue(ptFee.id);
				serviceControls.get('ptFeeA1').setValue(parseFloat(ptFee.a1).toFixed(2));
				serviceControls.get('ptFeeA2').setValue(parseFloat(ptFee.a2).toFixed(2));
			} else {
				serviceControls.get('ptFeeId').setValue('');
				serviceControls.get('ptFeeA1').setValue('');
				serviceControls.get('ptFeeA2').setValue('');
			}

			if (proFee) {
				serviceControls.get('proFeeId').setValue(proFee.id);
				serviceControls.get('proFeeA1').setValue(parseFloat(proFee.a1).toFixed(2));
				serviceControls.get('proFeeA2').setValue(parseFloat(proFee.a2).toFixed(2));
			} else {
				serviceControls.get('proFeeId').setValue('');
				serviceControls.get('proFeeA1').setValue('');
				serviceControls.get('proFeeA2').setValue('');
			}
		}
	}

	serviceSelected(event, index) {
		// @ts-ignore:
		var serviceControls = this.leadForm.get('services').controls[index];
		var serviceObj = serviceControls.get('serviceId').value;
		if (serviceObj) {
			//this.loadProfessionalsForFilter(serviceObj.id);

			//serviceControls.get('ptFeeId').setValue(serviceObj.ptFeeId);
			//serviceControls.get('ptFeeA1').setValue(serviceObj.ptFeeA1);
			//serviceControls.get('ptFeeA2').setValue(serviceObj.ptFeeA2);
			//serviceControls.get('proFeeId').setValue(serviceObj.proFeeId);
			//serviceControls.get('proFeeA1').setValue(serviceObj.proFeeA1);
			//serviceControls.get('proFeeA2').setValue(serviceObj.proFeeA2);
			serviceControls.patchValue({ 'professionalId': '' });
		} else {
			this.professionalsForFilter = [];
			this.filteredProfessionals = new Observable<FilterModel[]>();
			serviceControls.patchValue({ 'professionalId': '' });
			serviceControls.get('ptFeeId').setValue('');
			serviceControls.get('ptFeeA1').setValue('');
			serviceControls.get('ptFeeA2').setValue('');
			serviceControls.get('ptFeeCustom').setValue('');
			serviceControls.get('proFeeId').setValue('');
			serviceControls.get('proFeeA1').setValue('');
			serviceControls.get('proFeeA2').setValue('');
			serviceControls.get('proFeeCustom').setValue('');
		}

	}
	// end services

	// Service Professionals

	loadProfessionalsForFilter(serviceId: number) {
		this.spinner.show();
		this.staticService.getProfessionalsForFilter(serviceId).subscribe(res => {
			this.professionalsForFilter = res.data;

			if (this.lead.professionalId > 0) {
				var professional = this.professionalsForFilter.find(x => x.id == this.lead.professionalId);
				if (professional) {
					this.leadForm.patchValue({ 'professionalId': { id: professional.id, value: professional.value, ptFees: professional.ptFees, proFees: professional.proFees } });
				}
			}
		},
			() => {
				this.spinner.hide();
			},
			() => {
				this.spinner.hide();
			});
	}

	private _filterProfessionals(value: string): FilterModel[] {
		const filterValue = this._normalizeValue(value);
		return this.professionalsForFilter.filter(title => this._normalizeValue(title.value).includes(filterValue));
	}

	// Service Professionals

	//// Invoice Entities
	loadInvoiceEntitiesForFilter(ieId?: number) {
		this.staticService.getInvoiceEntitiesForFilter().subscribe(res => {
			this.invoiceEntitiesForFilter = res.data;

			this.filteredInvoiceEntities = this.leadForm.get('invoiceEntityId').valueChanges
				.pipe(
					startWith(''),
					map(value => this._filterInvoiceEntities(value))
				);

			if (ieId && ieId > 0) {
				const ie = this.invoiceEntitiesForFilter.find(x => x.id == ieId);
				if (ie) {
					this.leadForm.patchValue({ 'invoiceEntityId': { id: ie.id, value: ie.value } });
				}

			} else {
				if (this.lead.invoiceEntityId > 0) {
					const ie = this.invoiceEntitiesForFilter.find(x => x.id == this.lead.invoiceEntityId);
					if (ie) {
						this.leadForm.patchValue({ 'invoiceEntityId': { id: ie.id, value: ie.value } });
					}
				}
			}
		});
	}

	private _filterInvoiceEntities(value: string): FilterModel[] {
		const filterValue = this._normalizeValue(value);
		return this.invoiceEntitiesForFilter.filter(title => this._normalizeValue(title.value).includes(filterValue));
	}

	subscribeInvoiceEntity() {
		var differetIdControl = this.leadForm.get('haveDifferentIEId');
		var ieControl = this.leadForm.get('invoiceEntityId');

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
		const _messageType = this.lead.id > 0 ? MessageType.Update : MessageType.Create;
		var ieModel = new InvoiceEntityModel();
		const controls = this.leadForm.controls;
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
		ieModel.billingCity = controls.city.value;
		ieModel.mailingCity = controls.city.value;

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
		ieModel.personOfReference = controls.visitRequestingPerson.value;
		ieModel.personOfReferenceEmail = controls.email.value;
		ieModel.personOfReferencePhone = controls.mainPhone.value;
		ieModel.blackListId = controls.blacklistId.value;
		ieModel.discountPercent = controls.discount.value;

		const dialogRef = this.dialog.open(CreateInvoiceEntityDialogComponent, { data: ieModel });
		dialogRef.afterClosed().subscribe((res: ApiResponse) => {
			if (!res) {
				return;
			}

			// @ts-ignore
			this.loadInvoiceEntitiesForFilter(res.resp.data.id);
			this.layoutUtilsService.showActionNotification(_saveMessage, _messageType);
			this.detectChanges();
			//this.refreshLead(false, this.lead.id);
		});
	}

	// end Invoice Entities

	// countries
	loadCountiesForFilter() {
		this.staticService.getCountriesForFilter().subscribe(res => {
			this.countriesForFilter = res.data;

			this.filteredCountries = this.leadForm.get('countryId').valueChanges
				.pipe(
					startWith(''),
					map(value => this._filterCountries(value))
				);
			if (this.lead.countryId > 0) {
				var elem = this.countriesForFilter.find(x => x.id == this.lead.countryId);
				if (elem) {
					this.leadForm.patchValue({ 'countryId': { id: elem.id, value: elem.value } });
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

	/*Start closed events */
	controlFocusout(control) {
		const val = this.leadForm.get(control).value;
		if (val && val.id) return;
		this.leadForm.get(control).setValue('');
		this.cdr.markForCheck();
	}

	serviceControlFocusout(event, control, index) {
		// @ts-ignore
		var serviceControls = this.leadForm.get('services').controls[index];
		const val = serviceControls.get('serviceId').value;

		if (val && val.id) return val;
		//serviceControls.get('serviceId').setValue('');
		//this.cdr.markForCheck();

	}

	/*End Closed events */


	detectChanges() {
		try {
			this.cdr.detectChanges();
		} catch {

		}
	}

}
