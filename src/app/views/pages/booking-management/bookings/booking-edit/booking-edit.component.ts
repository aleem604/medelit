// Angular
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
// Material
import { MatDialog, MatSelect, DateAdapter, MAT_DATE_FORMATS } from '@angular/material';
// RxJS
import { Observable, BehaviorSubject, Subscription, of, ReplaySubject, Subject } from 'rxjs';
import { map, startWith, delay, first, takeUntil, filter } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../../core/reducers';
// Layout
import { SubheaderService, LayoutConfigService } from '../../../../../core/_base/layout';
// CRUD
import { LayoutUtilsService, TypesUtilsService, MessageType } from '../../../../../core/_base/crud';
// Services and Models
import {
	BookingModel,
	BookingService,
	StaticDataModel,

	StaticDataService,
	FilterModel,
	ApiResponse,
	MedelitStaticData,

	InvoicesService
} from '../../../../../core/medelit';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { BookingToInvoiceDialog } from '../booking-to-invoice/booking-to-invoice-dialog';
import { BookingCloneDialog } from '../booking-clone-dialog/booking-clone-dialog';
import { BookingCycleDialog } from '../booking-cycle-dialog/booking-cycle-dialog';


@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-booking-edit',
	templateUrl: './booking-edit.component.html',
	styleUrls: ['./booking-edit.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingEditComponent implements OnInit, OnDestroy {
	// Public properties
	booking: BookingModel;
	bookingId$: Observable<number>;
	titles: Observable<StaticDataModel>;
	languages: Observable<StaticDataModel>;
	countries: Observable<StaticDataModel>;
	cities: Observable<StaticDataModel>;
	relationaships: Observable<StaticDataModel>;
	services: Observable<StaticDataModel>;
	oldBooking: BookingModel;
	selectedTab = 0;
	loadingSubject = new BehaviorSubject<boolean>(true);
	loading$: Observable<boolean>;
	bookingForm: FormGroup;
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
	filteredCountries: Observable<FilterModel[]>;
	filteredHomeCountries: Observable<FilterModel[]>;
	filteredVisitCountries: Observable<FilterModel[]>;

	servicesForFilter: FilterModel[] = [];
	filteredServices: Observable<FilterModel[]>;

	professionalsForFilter: FilterModel[] = [];
	filteredProfessionals: Observable<FilterModel[]>;

	bookingTypesForFilter: FilterModel[];
	addedToAccountOptions: FilterModel[];
	relationshipsForFilter: FilterModel[];
	paymentMethodsOptions: FilterModel[];
	paymentStatusOptions: FilterModel[];
	discountNetworkOptions: FilterModel[];
	reportDeliveredOptions: FilterModel[];
	listedDiscountNetworkOptions: FilterModel[];
	buildingTypeOptions: FilterModel[];
	visitVenueOptions: FilterModel[];
	bookingStatusOptions: FilterModel[];
	bookingSourceOptions: FilterModel[];
	contactMethodOptions: FilterModel[];
	bookingCategoryOptions: FilterModel[];
	proAccountOptions: FilterModel[];
	labsForFilter: FilterModel[];

	invoiceEntitiesForFilter: FilterModel[] = [];
	filteredInvoiceEntities: Observable<FilterModel[]>;

	citiesForFilter: FilterModel[] = [];
	filteredCitiesHome: Observable<FilterModel[]>;
	filteredCitiesVisit: Observable<FilterModel[]>;

	countriesForFilter: FilterModel[] = [];
	filteredCountriesHome: Observable<FilterModel[]>;
	filteredCountriesVisit: Observable<FilterModel[]>;

	constructor(
		private store: Store<AppState>,
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private typesUtilsService: TypesUtilsService,
		private bookingFB: FormBuilder,
		public dialog: MatDialog,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private layoutConfigService: LayoutConfigService,
		private bookingService: BookingService,
		private staticService: StaticDataService,
		private invoiceService: InvoicesService,
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
				//	select(selectBookingById(id))
				//).subscribe(result => {
				//	if (!result) {
				//		this.loadBookingFromService(id);
				//		return;
				//	}

				//	this.loadBooking(result);
				//});
				this.loadBookingFromService(id);
			} else {
				const newBooking = new BookingModel();
				newBooking.clear();
				this.loadBooking(newBooking);
			}
		});

		// sticky portlet header
		window.onload = () => {
			const style = getComputedStyle(document.getElementById('kt_header'));
			this.headerMargin = parseInt(style.height, 0);
		};
	}

	loadBooking(_booking, fromService: boolean = false) {
		if (!_booking) {
			this.goBack('');
		}
		this.booking = _booking;
		this.bookingId$ = of(_booking.id);
		this.oldBooking = Object.assign({}, _booking);
		this.initBooking();
		this.loadStaticResources();

		if (fromService) {
			this.cdr.detectChanges();
		}
	}

	loadBookingFromService(bookingId) {
		this.loadingSubject.next(true);
		this.bookingService.getBookingById(bookingId).toPromise().then(res => {
			this.loadingSubject.next(false);
			let data = res as unknown as ApiResponse;
			this.loadBooking(data.data, true);
		}).catch((e) => {
			this.loadingSubject.next(false);
		});
	}

	ngOnDestroy() {
		if (this.componentSubscriptions) {
			this.componentSubscriptions.unsubscribe();
		}
	}

	initBooking() {
		this.createForm();
		this.loadingSubject.next(false);
		if (!this.booking.id) {
			this.subheaderService.setBreadcrumbs([
				{ title: 'booking-management', page: `/bookings` },
				{ title: 'Bookings', page: `/booking-management/bookings` },
				{ title: 'Create booking', page: `/booking-management/bookings/add` }
			]);
			return;
		}
		this.subheaderService.setTitle('Bookings');

		this.subheaderService.setBreadcrumbs([
			{ title: 'booking-management', page: `/bookings` },
			{ title: 'Bookings', page: `/booking-management/bookings` },
			{ title: 'Edit booking', page: `/booking-management/bookings/edit`, queryParams: { id: this.booking.id } }
		]);

	}

	createForm() {
		this.bookingForm = this.bookingFB.group({

			customerName: [this.booking.customerName, Validators.required],
			invoiceEntityName: [this.booking.invoiceEntityName, []],
			name: [this.booking.name, [Validators.required]],
			bookingStatusId: [this.booking.bookingStatusId, [Validators.required]],
			bookingDate: [this.booking.bookingDate, [Validators.required]],

			bookingTypeId: [this.booking.bookingTypeId, [Validators.required]],
			visitLanguageId: [this.booking.visitLanguageId, [Validators.required]],
			visitVenueId: [this.booking.visitVenueId, [Validators.required]],
			visitVenueDetail: [this.booking.visitVenueDetail, [Validators.required]],
			addressNotes: [this.booking.addressNotes, [Validators.required]],
			buzzer: [this.booking.buzzer, [Validators.required]],
			visitRequestingPerson: [this.booking.visitRequestingPerson, [Validators.required]],
			visitRequestingPersonRelationId: [this.booking.visitRequestingPersonRelationId, [Validators.required]],
			flatNumber: [this.booking.flatNumber, [Validators.required]],
			floor: [this.booking.floor, [Validators.required]],
			buildingTypeId: [this.booking.buildingTypeId, [Validators.required]],
			visitStreetName: [this.booking.visitStreetName, [Validators.required]],
			homeStreetName: [this.booking.homeStreetName, [Validators.required]],
			homePostCode: [this.booking.homePostCode, [Validators.required]],
			visitPostCode: [this.booking.visitPostCode, [Validators.required]],
			homeCityId: [this.booking.homeCityId, [Validators.required]],
			visitCityId: [this.booking.visitCityId, [Validators.required]],
			phoneNumber: [this.booking.phoneNumber, [Validators.required]],
			email: [this.booking.email, [Validators.required]],
			email2: [this.booking.email2, [Validators.required]],
			phone2: [this.booking.phone2, [Validators.required]],
			phone2Owner: [this.booking.phone2Owner, [Validators.required]],
			dateOfBirth: [this.booking.dateOfBirth, [Validators.required]],
			countryOfBirthId: [this.booking.countryOfBirthId, [Validators.required]],
			homeCountryId: [this.booking.homeCountryId, [Validators.required]],
			visitCountryId: [this.booking.visitCountryId, [Validators.required]],
			details: [this.booking.details, [Validators.required]],
			diagnosis: [this.booking.diagnosis, [Validators.required]],
			reasonForVisit: [this.booking.reasonForVisit, [Validators.required]],
			imToProId: [this.booking.imToProId, [Validators.required]],
			mailToPtId: [this.booking.mailToPtId, []],
			ptCalledForAppointmentId: [this.booking.ptCalledForAppointmentId, []],
			paymentConcludedId: [this.booking.paymentConcludedId, []],
			paymentMethodId: [this.booking.paymentMethodId, []],
			addToAccountingId: [this.booking.addToAccountingId, []],
			paymentStatusId: [this.booking.paymentStatusId, []],
			ccAuthorizationId: [this.booking.ccAuthorizationId, []],
			bankTransfterReceiptId: [this.booking.bankTransfterReceiptId, []],
			ccOwner: [this.booking.ccOwner, []],
			paymentArrivalDate: [this.booking.paymentArrivalDate, []],
			cashReturn: [this.booking.cashReturn, []],
			invoiceNumber: [this.booking.invoiceNumber, []],
			invoicingNotes: [this.booking.invoicingNotes, []],
			invoiceDueDate: [this.booking.invoiceDueDate, []],
			notesOnPayment: [this.booking.notesOnPayment, []],
			reportDeliveredId: [this.booking.reportDeliveredId, []],
			addToProAccountId: [this.booking.addToProAccountId, []],
			insuranceCoverId: [this.booking.insuranceCoverId, []],
			feedbackFromPro: [this.booking.feedbackFromPro, []],
			proAvailabilityAskedId: [this.booking.proAvailabilityAskedId, []],
			labCostsForMedelit: [this.booking.labCostsForMedelit, []],
			dateOnPrescription: [this.booking.dateOnPrescription, []],
			labId: [this.booking.labId, []],
			vials: [this.booking.vials, []],
			repeadPrescriptionNumber: [this.booking.repeadPrescriptionNumber, []],
			prescriptionNumber: [this.booking.prescriptionNumber, []],
			notes: [this.booking.notes, []],
			privateFee: [this.booking.privateFee, []],
			ticketFee: [this.booking.ticketFee, []],
			excemptionCode: [this.booking.excemptionCode, []],
			nhsOrPrivateId: [this.booking.nhsOrPrivateId, []],


			isAllDayVisit: [this.booking.isAllDayVisit, []],
			visitStartDate: [this.booking.visitStartDate, [Validators.required]],
			visitEndDate: [this.booking.visitEndDate, [Validators.required]],

			proDiscount: [this.booking.proDiscount, []],
			cashConfirmationMailId: [this.booking.cashConfirmationMailId, []],
			quantityHours: [this.booking.quantityHours, [Validators.required]],

			serviceId: [this.booking.serviceId, [Validators.required]],
			professionalId: [this.booking.professionalId, [Validators.required]],
			ptFee: [this.booking.ptFee, [Validators.required]],
			proFee: [this.booking.proFee, [Validators.required]],

			patientAge: [this.booking.patientAge, []],
			cycle: [this.booking.cycle, []],
			cycleNumber: [this.booking.cycleNumber, []],
			proInvoiceNumber: [this.booking.proInvoiceNumber, []],

			taxType: [this.booking.taxType, []],
			subTotal: [this.booking.subTotal, []],
			taxAmount: [this.booking.taxAmount, []],
			patientDiscount: [this.booking.patientDiscount, []],
			grossTotal: [this.booking.grossTotal, []],
			totalDue: [this.booking.totalDue, []],
			totalPaid: [this.booking.totalPaid, []],

		});
		this.setConstants();
	}

	setConstants() {
		this.bookingForm.get('visitStartDate').valueChanges.subscribe((d) => {
			if (d) {
				var years = Math.floor(moment(new Date(d)).diff(moment(new Date(this.bookingForm.get('dateOfBirth').value), "MM/DD/YYYY"), 'years', true));
				this.bookingForm.get('patientAge').setValue(years);
				return years;
			}
		});

		this.bookingForm.get('dateOfBirth').valueChanges.subscribe((d) => {
			if (d) {
				var years = Math.floor(moment(new Date(this.bookingForm.get('visitStartDate').value)).diff(moment(new Date(d), "MM/DD/YYYY"), 'years', true));
				this.bookingForm.get('patientAge').setValue(years);
				return years;
			}
		});

		this.bookingForm.get('ptFee').valueChanges.subscribe((d) => {
			this.bookingForm.get('cashReturn').setValue(d);
		});


		this.updateAccountings();
	}

	updateAccountings() {
		var ptFee = this.bookingForm.get('ptFee').value;
		var quantity = this.bookingForm.get('quantityHours').value;
		var taxType = this.bookingForm.get('taxType').value;
		var subTotal = parseInt(ptFee) * parseInt(quantity);
		var taxAmount = subTotal * parseInt(taxType) * 0.01;


		if (!isNaN(subTotal)) {
			this.bookingForm.get('subTotal').setValue(subTotal);
		}
		else {
			this.bookingForm.get('subTotal').setValue('');
		}

		if (!isNaN(taxAmount)) {
			this.bookingForm.get('taxAmount').setValue(taxAmount);
		} else {
			this.bookingForm.get('taxAmount').setValue('');
		}

		this.bookingForm.get('grossTotal').setValue(subTotal + taxAmount);


	}


	goBack(id) {
		this.loadingSubject.next(false);
		const url = `/booking-management/bookings?id=${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	goBackWithoutId() {
		this.router.navigateByUrl('/booking-management/bookings', { relativeTo: this.activatedRoute });
	}

	refreshBooking(isNew: boolean = false, id = 0) {
		this.loadingSubject.next(false);
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/booking-management/bookings/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	reset() {
		this.booking = Object.assign({}, this.oldBooking);
		this.createForm();
		this.hasFormErrors = false;
		this.bookingForm.markAsPristine();
		this.bookingForm.markAsUntouched();
		this.bookingForm.updateValueAndValidity();
	}

	onSumbit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.bookingForm.controls;
		/** check form */
		if (this.bookingForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		// tslint:disable-next-line:prefer-const
		let editedBooking = this.prepareBooking();

		if (editedBooking.id > 0) {
			this.updateBooking(editedBooking, withBack);
			return;
		}

		this.addBooking(editedBooking, withBack);
	}

	prepareBooking(): BookingModel {
		const controls = this.bookingForm.controls;
		const _booking = new BookingModel();
		_booking.id = this.booking.id;

		_booking.name = controls.name.value;
		_booking.bookingStatusId = +controls.bookingStatusId.value;
		_booking.bookingDate = controls.bookingDate.value;

		_booking.bookingTypeId = +controls.bookingTypeId.value;
		if (controls.visitLanguageId.value)
			_booking.visitLanguageId = +controls.visitLanguageId.value.id;
		_booking.visitVenueId = +controls.visitVenueId.value;
		_booking.visitVenueDetail = controls.visitVenueDetail.value;
		_booking.addressNotes = controls.addressNotes.value;
		_booking.buzzer = controls.buzzer.value;
		_booking.visitRequestingPerson = controls.visitRequestingPerson.value;
		_booking.visitRequestingPersonRelationId = controls.visitRequestingPersonRelationId.value;
		_booking.flatNumber = +controls.flatNumber.value;
		_booking.floor = +controls.floor.value;
		_booking.buildingTypeId = +controls.buildingTypeId.value;
		_booking.visitStreetName = controls.visitStreetName.value;
		_booking.homeStreetName = controls.homeStreetName.value;
		_booking.homePostCode = controls.homePostCode.value;
		_booking.visitPostCode = controls.visitPostCode.value;
		if (controls.homeCityId.value)
			_booking.homeCityId = controls.homeCityId.value.id;
		if (controls.visitCityId.value)
			_booking.visitCityId = controls.visitCityId.value.id;
		_booking.phoneNumber = controls.phoneNumber.value;
		_booking.email = controls.email.value;
		_booking.email2 = controls.email2.value;
		_booking.phone2 = controls.phone2.value;
		_booking.phone2Owner = controls.phone2Owner.value;
		_booking.dateOfBirth = controls.dateOfBirth.value;
		if (controls.countryOfBirthId.value)
			_booking.countryOfBirthId = controls.countryOfBirthId.value.id;

		if (controls.homeCountryId.value)
			_booking.homeCountryId = controls.homeCountryId.value.id;
		if (controls.visitCountryId.value)
			_booking.visitCountryId = controls.visitCountryId.value.id;
		_booking.details = controls.details.value;
		_booking.diagnosis = controls.diagnosis.value;
		_booking.reasonForVisit = controls.reasonForVisit.value;
		_booking.imToProId = controls.imToProId.value;
		_booking.mailToPtId = controls.mailToPtId.value;
		_booking.ptCalledForAppointmentId = controls.ptCalledForAppointmentId.value;
		_booking.paymentConcludedId = controls.paymentConcludedId.value;
		_booking.paymentMethodId = controls.paymentMethodId.value;
		_booking.addToAccountingId = controls.addToAccountingId.value;
		_booking.paymentStatusId = controls.paymentStatusId.value;
		_booking.ccAuthorizationId = controls.ccAuthorizationId.value;
		_booking.bankTransfterReceiptId = controls.bankTransfterReceiptId.value;
		_booking.ccOwner = controls.ccOwner.value;
		_booking.paymentArrivalDate = controls.paymentArrivalDate.value;
		_booking.cashReturn = controls.cashReturn.value;
		_booking.invoiceNumber = controls.invoiceNumber.value;
		_booking.invoicingNotes = controls.invoicingNotes.value;
		_booking.invoiceDueDate = controls.invoiceDueDate.value;
		_booking.notesOnPayment = controls.notesOnPayment.value;
		_booking.reportDeliveredId = controls.reportDeliveredId.value;
		_booking.addToProAccountId = controls.addToProAccountId.value;
		_booking.insuranceCoverId = controls.insuranceCoverId.value;
		_booking.feedbackFromPro = controls.feedbackFromPro.value;
		_booking.proAvailabilityAskedId = controls.proAvailabilityAskedId.value;
		_booking.labCostsForMedelit = controls.labCostsForMedelit.value;
		_booking.dateOnPrescription = controls.dateOnPrescription.value;
		_booking.labId = controls.labId.value;
		_booking.vials = controls.vials.value;
		_booking.repeadPrescriptionNumber = controls.repeadPrescriptionNumber.value;
		_booking.prescriptionNumber = controls.prescriptionNumber.value;
		_booking.notes = controls.notes.value;
		_booking.privateFee = controls.privateFee.value;
		_booking.ticketFee = controls.ticketFee.value;
		_booking.excemptionCode = controls.excemptionCode.value;
		_booking.nhsOrPrivateId = controls.nhsOrPrivateId.value;
		_booking.taxType = controls.taxType.value;
		_booking.subTotal = controls.subTotal.value;
		_booking.taxAmount = controls.taxAmount.value;
		_booking.patientDiscount = controls.patientDiscount.value;
		_booking.grossTotal = controls.grossTotal.value;

		_booking.isAllDayVisit = controls.isAllDayVisit.value;
		_booking.visitStartDate = controls.visitStartDate.value;
		_booking.visitEndDate = controls.visitEndDate.value;

		_booking.proDiscount = controls.proDiscount.value;
		_booking.cashConfirmationMailId = controls.cashConfirmationMailId.value;
		_booking.quantityHours = controls.quantityHours.value;

		if (controls.serviceId.value)
			_booking.serviceId = controls.serviceId.value.id;
		if (controls.professionalId.value)
			_booking.professionalId = controls.professionalId.value.id;
		_booking.ptFee = controls.ptFee.value;
		_booking.proFee = controls.proFee.value;

		_booking.patientAge = controls.patientAge.value;
		_booking.cycle = controls.cycle.value;
		_booking.cycleNumber = controls.cycleNumber.value;
		_booking.proInvoiceNumber = controls.proInvoiceNumber.value;
		_booking.totalDue = controls.totalDue.value;
		_booking.totalPaid = controls.totalPaid.value;

		return _booking;
	}

	addBooking(_booking: BookingModel, withBack: boolean = false) {
		this.spinner.show();
		this.bookingService.createBooking(_booking).toPromise().then((res) => {
			this.spinner.hide();
			const resp = res as unknown as ApiResponse;
			if (resp.success && resp.data.id > 0) {
				const message = `New booking successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 10000, true, true);
				this.refreshBooking(true, resp.data.id);
			} else {
				const message = `An error occured while processing your request. Please try again later.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 10000, true, true);
			}
		}).catch((e) => {
			this.spinner.hide();
		});



		//this.store.dispatch(new BookingOnServerCreated({ booking: _booking }));
		//this.componentSubscriptions = this.store.pipe(
		//	delay(1000),
		//	select(selectLastCreatedBookingId)
		//).subscribe(newId => {
		//	if (!newId) {
		//		return;
		//	}

		//	this.loadingSubject.next(false);
		//	if (withBack) {
		//		this.goBack(newId);
		//	} else {
		//		const message = `New booking successfully has been added.`;
		//		this.layoutUtilsService.showActionNotification(message, MessageType.Create, 10000, true, true);
		//		this.refreshBooking(true, newId);
		//	}
		//});
	}

	updateBooking(_booking: BookingModel, withBack: boolean = false) {
		this.spinner.show();
		this.bookingService.updateBooking(_booking).toPromise().then((res) => {
			this.spinner.hide();
			const resp = res as unknown as ApiResponse;
			if (resp.success && resp.data.id > 0) {
				const _booking = resp.data as unknown as BookingModel;
				this.loadBookingFromService(_booking.id);

				const message = `Booking successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 10000, true, true);
				//this.refreshBooking(false);
			} else {
				const message = `An error occured while processing your request. Please try again later.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 10000, true, true);
			}
		}).catch((e) => {
			this.spinner.hide();
		});

		//this.loadingSubject.next(true);
		//const updateBooking: Update<BookingModel> = {
		//	id: _booking.id,
		//	changes: _booking
		//};

		//this.store.dispatch(new BookingUpdated({
		//	partialBooking: updateBooking,
		//	booking: _booking
		//}));

		//of(undefined).pipe(delay(3000)).subscribe(() => { // Remove this line
		//	if (withBack) {
		//		this.goBack(_booking.id);
		//	} else {
		//		const message = `Booking successfully has been saved.`;
		//		this.layoutUtilsService.showActionNotification(message, MessageType.Update, 10000, true, true);
		//		this.refreshBooking(false);
		//	}
		//}); 
	}

	createInvoice() {

		this.hasFormErrors = false;
		const controls = this.bookingForm.controls;
		/** check form */
		if (this.bookingForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}
		let editedBooking = this.prepareBooking();

		this.spinner.show();
		this.bookingService.updateBooking(editedBooking).toPromise().then((res) => {
			const resp = res as unknown as ApiResponse;
			if (resp.success && resp.data.id > 0) {
				const _booking = resp.data as unknown as BookingModel;

				this.invoiceService.createInvoiceFromBooking(this.booking.id).toPromise().then((res) => {
					this.spinner.hide();
					if (res.success) {
						this.layoutUtilsService.showActionNotification("Invoice is created successfully.", MessageType.Create, 5000, true);

					} else {
						this.layoutUtilsService.showActionNotification("An error occured while processing your request. Please try again later.", MessageType.Create, 5000, true);
					}
				}).catch((e) => {
					this.spinner.hide();
					this.layoutUtilsService.showActionNotification("An error occured while processing your request. Please try again later.", MessageType.Create, 5000, true);
				});



			} else {
				const message = `An error occured while processing your request. Please try again later.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 10000, true, true);
			}
		}).catch((e) => {
			this.spinner.hide();
		});

	}

	addToExistingInvoice(): void {
		this.hasFormErrors = false;
		const controls = this.bookingForm.controls;
		/** check form */
		if (this.bookingForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}
		let editedBooking = this.prepareBooking();

		this.spinner.show();
		this.bookingService.updateBooking(editedBooking).toPromise().then((res) => {
			this.spinner.hide();

			const resp = res as unknown as ApiResponse;
			if (resp.success && resp.data.id > 0) {
				const _booking = resp.data as unknown as BookingModel;
				const dialogRef = this.dialog.open(BookingToInvoiceDialog, {
					width: '500px',
					height: '300px',
					data: this.booking
				});

				dialogRef.afterClosed().subscribe(result => {
					if (result) {
						console.log(result);
					}
				});
			} else {
				const message = `An error occured while processing your request. Please try again later.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 10000, true, true);
			}
		}).catch((e) => {
			this.spinner.hide();
			const message = `An error occured while processing your request. Please try again later.`;
			this.layoutUtilsService.showActionNotification(message, MessageType.Update, 10000, true, true);
		});;


	}

	cloneBooking() {

		this.hasFormErrors = false;
		const controls = this.bookingForm.controls;
		/** check form */
		if (this.bookingForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}
		let editedBooking = this.prepareBooking();

		this.spinner.show();
		this.bookingService.updateBooking(editedBooking).toPromise().then((res) => {
			this.spinner.hide();
			const resp = res as unknown as ApiResponse;
			if (resp.success && resp.data.id > 0) {

				const dialogRef = this.dialog.open(BookingCloneDialog, {
					width: '250px',
					data: { copies: 1 }
				});

				dialogRef.afterClosed().subscribe(result => {
					if (result) {
						this.spinner.show();
						this.bookingService.createClone(this.booking.id, result).toPromise().then((res) => {
							this.spinner.hide();
							if (res.success) {
								this.layoutUtilsService.showActionNotification("Clone process completed successfully.", MessageType.Create, 3000, true);

							} else {
								this.layoutUtilsService.showActionNotification("An error occured while processing your request. Please try again later.", MessageType.Create, 5000, true);
							}

						}).catch((error) => {
							this.spinner.hide();
							this.layoutUtilsService.showActionNotification("An error occured while processing your request. Please try again later.", MessageType.Create, 5000, true);
						});
					}
				});

			} else {
				const message = `An error occured while processing your request. Please try again later.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 10000, true, true);
			}
		}).catch((e) => {
			this.spinner.hide();
		}).finally(() => {
			this.spinner.hide();
		});
	}

	createCycle() {

		this.hasFormErrors = false;
		const controls = this.bookingForm.controls;
		/** check form */
		if (this.bookingForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}
		let editedBooking = this.prepareBooking();

		this.spinner.show();
		this.bookingService.updateBooking(editedBooking).toPromise().then((res) => {
			this.spinner.hide();
			const resp = res as unknown as ApiResponse;
			if (resp.success) {

				const dialogRef = this.dialog.open(BookingCycleDialog, {
					width: '250px',
					data: { cycles: 5 }
				});

				dialogRef.afterClosed().subscribe(result => {
					if (result) {
						this.spinner.show();
						this.bookingService.createCycle(this.booking.id, result).toPromise().then((res) => {
							this.spinner.hide();
							if (res.success) {
								this.layoutUtilsService.showActionNotification("Clone process completed successfully.", MessageType.Create, 3000, true);

							} else {
								this.layoutUtilsService.showActionNotification("An error occured while processing your request. Please try again later.", MessageType.Create, 5000, true);
							}

						}).catch((error) => {
							this.spinner.hide();
							this.layoutUtilsService.showActionNotification("An error occured while processing your request. Please try again later.", MessageType.Create, 5000, true);
						});
					}
				});

			} else {
				const message = `An error occured while processing your request. Please try again later.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 10000, true, true);
			}
		}).catch((e) => {
			this.spinner.hide();
		}).finally(() => {
			this.spinner.hide();
		});
	}

	getComponentTitle() {
		let result = 'Create booking';
		if (!this.booking || !this.booking.id) {
			return result;
		}

		result = `Edit booking - ${this.booking.name}`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}


	/*Fitlers Section*/
	loadStaticResources() {
		this.detectChanges();
		this.loadLanguagesForFilter();
		this.loadCountriesFilter();
		this.loadCitiesForFilter();
		this.loadCountiesForFilter();
		this.loadServicesForFilter();


		this.staticService.getStaticDataForFitler().pipe(map(n => n.data as unknown as MedelitStaticData[])).toPromise().then((data) => {

			this.addedToAccountOptions = data.map((el) => { return { id: el.id, value: el.addToAccountOptions }; }).filter((e) => { if (e.value && e.value.length > 0) return e; });
			if (this.booking.addToAccountingId) {
				var obj = data.find((e) => { return e.id == this.booking.addToAccountingId });
				if (obj)
					this.bookingForm.get('addToAccountingId').setValue(obj.id);
			}

			// booking types
			this.bookingTypesForFilter = data.map((el) => { return { id: el.id, value: el.bookingTypes }; }).filter((e) => { if (e.value && e.value.length > 0) return e; });
			if (this.booking.bookingTypeId) {
				var obj = data.find((e) => { return e.id == this.booking.bookingTypeId });
				if (obj)
					this.bookingForm.get('bookingTypeId').setValue(obj.id);
			}

			// report delivered options
			this.reportDeliveredOptions = data.map((el) => { return { id: el.id, value: el.reportDeliveryOptions }; }).filter((e) => { if (e.value && e.value.length > 0) return e; });

			if (this.booking.reportDeliveredId) {
				var obj = data.find((e) => { return e.id == this.booking.reportDeliveredId });
				if (obj)
					this.bookingForm.get('reportDeliveredId').setValue(obj.id);
			}

			// payment status options
			this.paymentStatusOptions = data.map((el) => { return { id: el.id, value: el.paymentStatus }; }).filter((e) => { if (e.value && e.value.length > 0) return e; });

			if (this.booking.paymentStatusId) {
				var obj = data.find((e) => { return e.id == this.booking.paymentStatusId });
				if (obj)
					this.bookingForm.get('paymentStatusId').setValue(obj.id);
			}

			// relationship for filter
			this.relationshipsForFilter = data.map((el) => { return { id: el.id, value: el.reportDeliveryOptions }; }).filter((e) => { if (e.value && e.value.length > 0) return e; });

			if (this.booking.visitRequestingPersonRelationId) {
				var obj = data.find((e) => { return e.id == this.booking.visitRequestingPersonRelationId });
				if (obj)
					this.bookingForm.get('visitRequestingPersonRelationId').setValue(obj.id);
			}

			// payment method 
			this.paymentMethodsOptions = data.map((el) => { return { id: el.id, value: el.paymentMethods }; }).filter((e) => { if (e.value && e.value.length > 0) return e; });

			if (this.booking.paymentMethodId) {
				var obj = data.find((e) => { return e.id == this.booking.paymentMethodId });
				if (obj)
					this.bookingForm.get('paymentMethodId').setValue(obj.id);
			}

			// building types
			this.buildingTypeOptions = data.map((el) => { return { id: el.id, value: el.buildingTypes }; }).filter((e) => { if (e.value && e.value.length > 0) return e; });

			if (this.booking.buildingTypeId) {
				var obj = data.find((e) => { return e.id == this.booking.buildingTypeId });
				if (obj)
					this.bookingForm.get('buildingTypeId').setValue(obj.id);
			}

			// visit venue
			this.visitVenueOptions = data.map((el) => { return { id: el.id, value: el.visitVenues }; }).filter((e) => { if (e.value && e.value.length > 0) return e; });

			if (this.booking.visitVenueId) {
				const obj = data.find((e) => { return e.id == this.booking.visitVenueId });
				if (obj)
					this.bookingForm.get('visitVenueId').setValue(obj.id);
			}

			// booking status 
			this.bookingStatusOptions = data.map((el) => { return { id: el.id, value: el.bookingStatus }; }).filter((e) => { if (e.value && e.value.length > 0) return e; });

			if (this.booking.bookingStatusId) {
				const obj = data.find((e) => { return e.id == this.booking.bookingStatusId });
				if (obj)
					this.bookingForm.get('bookingStatusId').setValue(obj.id);
			}
		});

		this.staticService.getLabsForFilter().pipe(map(n => n.data as unknown as FilterModel[])).toPromise().then((data) => {
			this.labsForFilter = data;

			if (this.booking.labId) {
				const obj = data.find((e) => { return e.id == this.booking.labId });
				if (obj)
					this.bookingForm.get('labId').setValue(obj.id);
			}
		});


		if (this.booking.insuranceCoverId) {
			this.bookingForm.get('insuranceCoverId').setValue(this.booking.insuranceCoverId.toString());
		}

		if (this.booking.paymentConcludedId != undefined) {
			this.bookingForm.get('paymentConcludedId').setValue(this.booking.paymentConcludedId.toString());
		}

		if (this.booking.ccAuthorizationId != undefined) {
			this.bookingForm.get('ccAuthorizationId').setValue(this.booking.ccAuthorizationId.toString());
		}

		if (this.booking.cashConfirmationMailId != undefined) {
			this.bookingForm.get('cashConfirmationMailId').setValue(this.booking.cashConfirmationMailId.toString());
		}

		if (this.booking.bankTransfterReceiptId != undefined) {
			this.bookingForm.get('bankTransfterReceiptId').setValue(this.booking.bankTransfterReceiptId.toString());
		}

		if (this.booking.proAvailabilityAskedId != undefined) {
			this.bookingForm.get('proAvailabilityAskedId').setValue(this.booking.proAvailabilityAskedId.toString());
		}

		if (this.booking.ptCalledForAppointmentId != undefined) {
			this.bookingForm.get('ptCalledForAppointmentId').setValue(this.booking.ptCalledForAppointmentId.toString());
		}

		if (this.booking.imToProId != undefined) {
			this.bookingForm.get('imToProId').setValue(this.booking.imToProId.toString());
		}

		if (this.booking.mailToPtId != undefined) {
			this.bookingForm.get('mailToPtId').setValue(this.booking.mailToPtId.toString());
		}

		if (this.booking.nhsOrPrivateId != undefined) {
			this.bookingForm.get('nhsOrPrivateId').setValue(this.booking.nhsOrPrivateId.toString());
		}

	}

	//// Languages
	loadLanguagesForFilter() {
		this.staticService.getLanguagesForFilter().subscribe(res => {
			this.languagesForFilter = res.data;

			this.filteredLanguages = this.bookingForm.get('visitLanguageId').valueChanges
				.pipe(
					startWith(''),
					map(value => this._filterLanguages(value))
				);
			if (this.booking.visitLanguageId > 0) {
				var title = this.languagesForFilter.find(x => x.id == this.booking.visitLanguageId);
				if (title) {
					this.bookingForm.patchValue({ 'visitLanguageId': { id: title.id, value: title.value } });
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
	loadCountriesFilter() {
		this.staticService.getCountriesForFilter().subscribe(res => {
			this.countriesForCountryOfBirthForFilter = res.data;

			this.filteredCountries = this.bookingForm.get('countryOfBirthId').valueChanges
				.pipe(
					startWith(''),
					map(value => this.filteredCountryOfBirth(value))
				);
			if (this.booking.countryOfBirthId > 0) {
				var title = this.countriesForCountryOfBirthForFilter.find(x => x.id == this.booking.countryOfBirthId);
				if (title) {
					this.bookingForm.patchValue({ 'countryOfBirthId': { id: title.id, value: title.value } });
				}
			}


			this.filteredHomeCountries = this.bookingForm.get('homeCountryId').valueChanges
				.pipe(
					startWith(''),
					map(value => this.filteredCountryOfBirth(value))
				);
			if (this.booking.homeCountryId > 0) {
				var title = this.countriesForCountryOfBirthForFilter.find(x => x.id == this.booking.homeCountryId);
				if (title) {
					this.bookingForm.patchValue({ 'homeCountryId': { id: title.id, value: title.value } });
				}
			}

			this.filteredVisitCountries = this.bookingForm.get('visitCountryId').valueChanges
				.pipe(
					startWith(''),
					map(value => this.filteredCountryOfBirth(value))
				);
			if (this.booking.visitCountryId > 0) {
				var title = this.countriesForCountryOfBirthForFilter.find(x => x.id == this.booking.visitCountryId);
				if (title) {
					this.bookingForm.patchValue({ 'visitCountryId': { id: title.id, value: title.value } });
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
		this.staticService.getServicesForFilter().subscribe(res => {
			this.servicesForFilter = res.data;

			this.filteredServices = this.bookingForm.get('serviceId').valueChanges
				.pipe(
					startWith(''),
					map(value => this._filterServices(value))
				);
			if (this.booking.serviceId > 0) {
				var service = this.servicesForFilter.find(x => x.id == this.booking.serviceId);
				if (service) {
					// @ts-ignore
					this.bookingForm.patchValue({ 'serviceId': { id: service.id, value: service.value, vat: service.vat } });
				}
				this.loadProfessionalsForFilter(this.booking.serviceId);
			}
		});


	}
	private _filterServices(value: string): FilterModel[] {
		const filterValue = this._normalizeValue(value);
		return this.servicesForFilter.filter(title => this._normalizeValue(title.value).includes(filterValue));
	}

	serviceDrpClosed() {
		this.bookingForm.get('professionalId').setValue('');
		var service = this.bookingForm.get('serviceId').value;
		if (service) {
			this.loadProfessionalsForFilter(service.id);
			this.bookingForm.get('ptFee').setValue(service.ptFeeA1);
			this.bookingForm.get('proFee').setValue(service.proFeeA1);
			this.bookingForm.get('taxType').setValue(service.vat);

			if (!service.timeService)
				this.bookingForm.get('quantityHours').setValue(1);

		} else {
			this.professionalsForFilter = [];
			this.filteredProfessionals = new Observable<FilterModel[]>();
			this.bookingForm.patchValue({ 'professionalId': '' });
			this.bookingForm.get('ptFee').setValue('');
			this.bookingForm.get('proFee').setValue('');
			this.bookingForm.get('taxType').setValue('');
		}
		this.updateAccountings();

	}


	serviceSelected(event, index) {
		// @ts-ignore:
		var serviceControls = this.bookingForm.get('services').controls[index];
		var serviceObj = serviceControls.get('serviceId').value;
		if (serviceObj) {
			this.loadProfessionalsForFilter(serviceObj.id);

			serviceControls.get('ptFee').setValue(serviceObj.ptFeeA1);
			serviceControls.get('proFee').setValue(serviceObj.proFeeA1);

		} else {
			this.professionalsForFilter = [];
			this.filteredProfessionals = new Observable<FilterModel[]>();
			serviceControls.patchValue({ 'professionalId': '' });
			serviceControls.get('ptFee').setValue('');
			serviceControls.get('proFee').setValue('');
		}

	}

	// end services

	// Service Professionals
	loadProfessionalsForFilter(serviceId?: number) {
		this.staticService.getProfessionalsForFilter(serviceId).subscribe(res => {
			this.professionalsForFilter = res.data.filter(m => m.sid == serviceId);

			this.filteredProfessionals = this.bookingForm.get('professionalId').valueChanges
				.pipe(
					startWith(''),
					map(value => this._filterProfessionals(value))
				);
			if (this.booking.professionalId > 0) {
				var professional = this.professionalsForFilter.find(x => x.id == this.booking.professionalId);
				if (professional) {
					this.bookingForm.patchValue({ 'professionalId': { id: professional.id, value: professional.value } });
				}
			}
		});

	}
	private _filterProfessionals(value: string): FilterModel[] {
		try {
			const filterValue = this._normalizeValue(value);

			return this.professionalsForFilter.filter(title => this._normalizeValue(title.value).includes(filterValue));
		} catch (e) {
			return [];
		}
	}

	// Service Professionals

	//// Invoice Entities
	loadInvoiceEntitiesForFilter() {
		this.staticService.getInvoiceEntitiesForFilter().subscribe(res => {
			this.invoiceEntitiesForFilter = res.data;

			this.filteredInvoiceEntities = this.bookingForm.get('invoiceEntityId').valueChanges
				.pipe(
					startWith(''),
					map(value => this._filterInvoiceEntities(value))
				);
			if (this.booking.invoiceEntityId > 0) {
				var ie = this.invoiceEntitiesForFilter.find(x => x.id == this.booking.invoiceEntityId);
				if (ie) {
					this.bookingForm.patchValue({ 'invoiceEntityId': { id: ie.id, value: ie.value } });
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

			this.filteredCitiesHome = this.bookingForm.get('homeCityId').valueChanges
				.pipe(
					startWith(''),
					map(value => this._filterCities(value))
				);
			if (this.booking.homeCityId > 0) {
				var elem = this.citiesForFilter.find(x => x.id == this.booking.homeCityId);
				if (elem) {
					this.bookingForm.patchValue({ 'homeCityId': { id: elem.id, value: elem.value } });
				}
			}

			this.filteredCitiesVisit = this.bookingForm.get('visitCityId').valueChanges
				.pipe(
					startWith(''),
					map(value => this._filterCities(value))
				);
			if (this.booking.visitCityId > 0) {
				var elem = this.citiesForFilter.find(x => x.id == this.booking.visitCityId);
				if (elem) {
					this.bookingForm.patchValue({ 'visitCityId': { id: elem.id, value: elem.value } });
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

			this.filteredCountriesHome = this.bookingForm.get('homeCountryId').valueChanges
				.pipe(
					startWith(''),
					map(value => this._filterCountries(value))
				);
			if (this.booking.homeCountryId > 0) {
				var elem = this.countriesForFilter.find(x => x.id == this.booking.homeCountryId);
				if (elem) {
					this.bookingForm.patchValue({ 'homeCountryId': { id: elem.id, value: elem.value } });
				}
			}

			this.filteredCountriesVisit = this.bookingForm.get('visitCountryId').valueChanges
				.pipe(
					startWith(''),
					map(value => this._filterCountries(value))
				);
			if (this.booking.visitCountryId > 0) {
				var elem = this.countriesForFilter.find(x => x.id == this.booking.visitCountryId);
				if (elem) {
					this.bookingForm.patchValue({ 'visitCountryId': { id: elem.id, value: elem.value } });
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

	detectChanges() {
		try {
			this.cdr.detectChanges();
		} catch (e) {

		}
	}

}
