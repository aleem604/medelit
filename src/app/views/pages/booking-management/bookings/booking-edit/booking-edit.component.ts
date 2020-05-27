// Angular
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl, ValidatorFn } from '@angular/forms';
// Material
import { MatDialog, MatTabChangeEvent } from '@angular/material';
// RxJS
import { Observable, BehaviorSubject, Subscription, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
// NGRX
import { Store } from '@ngrx/store';
import { AppState } from '../../../../../core/reducers';
// Layout
import { SubheaderService } from '../../../../../core/_base/layout';
// CRUD
import { LayoutUtilsService, MessageType } from '../../../../../core/_base/crud';
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
import { AlertDialogComponent } from '../../../../partials/alert-dialog/alert-dialog.component';
import { MedelitConstants } from '../../../../../core/_base/constants/medelit-contstants';
import { MedelitBaseComponent } from '../../../../../core/_base/components/medelit-base.component';

@Component({
	selector: 'kt-booking-edit',
	templateUrl: './booking-edit.component.html',
	styleUrls: ['./booking-edit.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingEditComponent extends MedelitBaseComponent implements OnInit, OnDestroy {
	// Public properties
	booking: BookingModel;
	bookingId$: Observable<number>;
	timedService: boolean;

	titles: Observable<StaticDataModel>;
	languages: Observable<StaticDataModel>;
	countries: Observable<StaticDataModel>;
	cities: Observable<StaticDataModel>;
	relationaships: Observable<StaticDataModel>;
	services: Observable<StaticDataModel>;
	oldBooking: BookingModel;
	selectedTab = 0;
	tabTitle: string = '';
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
		private bookingFB: FormBuilder,
		public dialog: MatDialog,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private bookingService: BookingService,
		private staticService: StaticDataService,
		private invoiceService: InvoicesService,
		private spinner: NgxSpinnerService,
		private cdr: ChangeDetectorRef) {
		super();
	}

	ngOnInit() {
		this.loading$ = this.loadingSubject.asObservable();
		this.loadingSubject.next(false);
		this.activatedRoute.params.subscribe(params => {
			const id = parseInt(params.id);
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
		this.detectChanges();
		this.loadStaticResources();
	}

	loadBookingFromService(bookingId) {
		this.spinner.show();
		this.bookingService.getBookingById(bookingId).toPromise().then(res => {
			let data = res as unknown as ApiResponse;
			this.loadBooking(data.data, true);
		});
	}

	ngOnDestroy() {
		if (this.componentSubscriptions) {
			this.componentSubscriptions.unsubscribe();
		}
	}

	initBooking() {
		try {
			this.createForm();
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
		} catch (e) {
			console.log(e);
		}
	}

	createForm() {
		this.bookingForm = this.bookingFB.group({

			customerName: [this.booking.customerName, [Validators.required]],
			invoiceEntityName: [this.booking.invoiceEntityName, []],
			bookingName: [this.booking.bookingName, []],
			bookingStatusId: [this.booking.bookingStatusId, [Validators.required]],
			bookingDate: [this.formatDate(this.booking.bookingDate), [Validators.required]],

			bookingTypeId: [this.booking.bookingTypeId, [Validators.required]],
			visitLanguageId: [this.booking.visitLanguageId, [Validators.required]],
			visitVenueId: [this.booking.visitVenueId, [Validators.required]],
			visitVenueDetail: [this.booking.visitVenueDetail, []],
			addressNotes: [this.booking.addressNotes],
			buzzer: [this.booking.buzzer],
			visitRequestingPerson: [this.booking.visitRequestingPerson],
			visitRequestingPersonRelationId: [this.booking.visitRequestingPersonRelationId],
			flatNumber: [this.booking.flatNumber],
			floor: [this.booking.floor],
			buildingTypeId: [this.booking.buildingTypeId],
			visitStreetName: [this.booking.visitStreetName, [Validators.required]],
			homeStreetName: [this.booking.homeStreetName, [Validators.required]],
			homePostCode: [this.booking.homePostCode, [Validators.required]],
			visitPostCode: [this.booking.visitPostCode, [Validators.required]],
			homeCity: [this.booking.homeCity, [Validators.required]],
			visitCity: [this.booking.visitCity, [Validators.required]],
			phoneNumber: [this.booking.phoneNumber, [Validators.required, Validators.pattern(MedelitConstants.mobnumPattern)]],
			email: [this.booking.email, [Validators.required]],
			phone2: [this.booking.phone2, [Validators.pattern(MedelitConstants.mobnumPattern)]],
			phone2Owner: [this.booking.phone2Owner],
			//dateOfBirth: [this.booking.dateOfBirth],
			//countryOfBirthId: [this.booking.countryOfBirthId],
			homeCountryId: [this.booking.homeCountryId, [Validators.required]],
			visitCountryId: [this.booking.visitCountryId, [Validators.required]],
			details: [this.booking.details, []],
			diagnosis: [this.booking.diagnosis],
			reasonForVisit: [this.booking.reasonForVisit, [Validators.required]],
			imToProId: [this.booking.imToProId],
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
			visitStartDate: [this.formatDate(this.booking.visitStartDate), []],
			visitStartTime: [this.setTime(this.booking.visitStartDate), []],
			visitEndDate: [this.formatDate(this.booking.visitEndDate), []],
			visitEndTime: [this.setTime(this.booking.visitEndDate), []],

			proDiscount: [this.booking.proDiscount, []],
			cashConfirmationMailId: [this.booking.cashConfirmationMailId, []],
			quantityHours: [this.booking.quantityHours, [Validators.required, Validators.min(1), Validators.max(50)]],

			serviceId: [this.booking.serviceId, [Validators.required]],
			professionalId: [this.booking.professionalId, [Validators.required]],
			ptFeeA1: [this.toDec(this.booking.ptFeeA1), [Validators.required]],
			ptFeeA2: [this.toDec(this.booking.ptFeeA2), [Validators.required]],
			isPtFeeA1: [this.booking.isPtFeeA1, [Validators.required]],

			proFeeA1: [this.toDec(this.booking.proFeeA1), [Validators.required]],
			proFeeA2: [this.toDec(this.booking.proFeeA2), [Validators.required]],
			isProFeeA1: [this.booking.isProFeeA1, [Validators.required]],

			itemNameOnInvoice: [this.booking.itemNameOnInvoice, [Validators.required]],

			patientAge: [this.booking.patientAge, []],
			cycle: [this.booking.cycle, []],
			cycleNumber: [this.booking.cycleNumber, []],
			proInvoiceNumber: [this.booking.proInvoiceNumber, []],

			taxType: [this.booking.taxType, [Validators.required]],
			subTotal: [this.toDec(this.booking.subTotal), []],
			taxAmount: [this.toDec(this.booking.taxAmount), []],
			patientDiscount: [this.toDec(this.booking.patientDiscount), []],
			grossTotal: [this.toDec(this.booking.grossTotal), []],
			totalDue: [this.toDec(this.booking.totalDue), []],
			totalPaid: [this.toDec(this.booking.totalPaid), []],

		}, { validator: this.dateLessThan() });

		this.setConstants();
		this.setEndDateTime();
	}

	dateLessThan(): ValidatorFn {
		return (group: FormGroup): { [key: string]: any } => {
			let s = group.controls['visitStartDate'];
			let e = group.controls['visitEndDate'];
			if (s.value && e.value) {

				let fromDate = new Date(this.formatDateWithTimeToServer(group.controls['visitStartDate'].value, group.controls['visitStartTime'].value));
				let toDate = new Date(this.formatDateWithTimeToServer(group.controls['visitEndDate'].value, group.controls['visitEndTime'].value));

				if (fromDate.getTime() > toDate.getTime()) {
					return {
						dates: "Visit End Date should be less than Date to"
					};
				}
			}
			return {};
		}
	}

	checkDates() {
		var startDate = this.bookingForm.get('visitStartDate').value;
		var endDate = this.bookingForm.get('visitEndDate').value;
		if (startDate && endDate) {
			const sdate = new Date(startDate);
			var edate = new Date(endDate);
			if (edate < sdate)
				this.bookingForm.get('visitEndDate').setValue(sdate);
		}
	}
	setEndDateTime() {
		this.bookingForm.get('visitStartDate').valueChanges.subscribe(v => {
			let sdate = new Date(v);
			let edate = new Date(sdate.getFullYear(), sdate.getMonth(), sdate.getDate(), sdate.getHours() + 1, sdate.getMinutes());

			this.bookingForm.get('visitEndDate').setValue(edate);
			this.bookingForm.updateValueAndValidity();
		});

	}


	setConstants() {
		this.bookingForm.get('visitStartDate').valueChanges.subscribe((d) => {
			if (d) {
				var years = Math.floor(moment(new Date(d)).diff(moment(new Date(this.booking.dateOfBirth), "MM/DD/YYYY"), 'years', true));
				this.bookingForm.get('patientAge').setValue(years);
				return years;
			}
		});

		//this.bookingForm.get('dateOfBirth').valueChanges.subscribe((d) => {
		//	if (d) {
		//		var years = Math.floor(moment(new Date(this.bookingForm.get('visitStartDate').value)).diff(moment(new Date(d), "MM/DD/YYYY"), 'years', true));
		//		this.bookingForm.get('patientAge').setValue(years);
		//		return years;
		//	}
		//});

		this.bookingForm.get('ptFeeA1').valueChanges.subscribe((d) => {
			var paymentMethodId = this.bookingForm.get('paymentMethodId').value;
			if (paymentMethodId === '2' || paymentMethodId === '3') {
				this.bookingForm.get('cashReturn').setValue(d);
			}
		});

		this.bookingForm.get('ptFeeA2').valueChanges.subscribe((d) => {
			var paymentMethodId = this.bookingForm.get('paymentMethodId').value;
			if (paymentMethodId === '2' || paymentMethodId === '3') {
				this.bookingForm.get('cashReturn').setValue(d);
			}
		});

		this.updateAccountings();
	}

	updateAccountings() {
		var ptFee = this.bookingForm.get('isPtFeeA1').value === '1' ? this.bookingForm.get('ptFeeA1').value : this.bookingForm.get('ptFeeA2').value;
		var patientDiscount = this.bookingForm.get('patientDiscount').value;
		var quantity = this.bookingForm.get('quantityHours').value;
		var taxType = this.bookingForm.get('taxType').value;
		var subTotal = parseInt(ptFee) * parseInt(quantity);
		var taxAmount = subTotal * (parseInt(taxType) * 0.01);


		if (!isNaN(subTotal)) {
			this.bookingForm.get('subTotal').setValue(subTotal.toFixed(2));
		}
		else {
			this.bookingForm.get('subTotal').setValue('');
		}

		if (!isNaN(taxAmount)) {
			this.bookingForm.get('taxAmount').setValue(taxAmount.toFixed(2));
		} else {
			this.bookingForm.get('taxAmount').setValue('');
		}
		let grossTotal = subTotal + taxAmount;
		if (patientDiscount) {
			grossTotal -= patientDiscount;
		}

		this.bookingForm.get('grossTotal').setValue(grossTotal.toFixed(2));
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
		this.dateLessThan();
		const controls = this.bookingForm.controls;
		/** check form */
		Object.keys(controls).forEach(controlName => {
			if (controls[controlName].status === 'INVALID')
				console.log('invlaid controls', controlName);
		});


		if (this.bookingForm.invalid) {
			Object.keys(controls).forEach(controlName => {
				controls[controlName].markAsTouched();
			});

			this.hasFormErrors = true;
			this.selectedTab = 0;
			window.scroll(0, 0);
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

		_booking.bookingName = controls.bookingName.value;
		_booking.bookingStatusId = +controls.bookingStatusId.value;
		_booking.bookingDate = this.toDateFormat(controls.bookingDate.value);

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
		_booking.homeCity = controls.homeCity.value;
		_booking.visitCity = controls.visitCity.value;
		_booking.phoneNumber = controls.phoneNumber.value;
		_booking.email = controls.email.value;
		_booking.phone2 = controls.phone2.value;
		_booking.phone2Owner = controls.phone2Owner.value;
		//_booking.dateOfBirth = controls.dateOfBirth.value;
		//if (controls.countryOfBirthId.value)
		//	_booking.countryOfBirthId = controls.countryOfBirthId.value.id;

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
		_booking.visitStartDate = this.formatDateWithTimeToServer(controls.visitStartDate.value, controls.visitStartTime.value);
		_booking.visitEndDate = this.formatDateWithTimeToServer(controls.visitEndDate.value, controls.visitEndTime.value);

		_booking.proDiscount = controls.proDiscount.value;
		_booking.cashConfirmationMailId = controls.cashConfirmationMailId.value;
		_booking.quantityHours = controls.quantityHours.value;

		if (controls.serviceId.value)
			_booking.serviceId = controls.serviceId.value.id;
		if (controls.professionalId.value)
			_booking.professionalId = controls.professionalId.value.id;
		_booking.ptFeeA1 = controls.ptFeeA1.value;
		_booking.ptFeeA2 = controls.ptFeeA2.value;
		_booking.isPtFeeA1 = controls.isPtFeeA1.value;

		_booking.proFeeA1 = controls.proFeeA1.value;
		_booking.proFeeA2 = controls.proFeeA2.value;
		_booking.isProFeeA1 = controls.isProFeeA1.value;
		_booking.itemNameOnInvoice = controls.itemNameOnInvoice.value;

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
		}).finally(() => {
			this.spinner.hide();
		});

	}

	updateBooking(_booking: BookingModel, withBack: boolean = false) {
		this.spinner.show();
		this.bookingService.updateBooking(_booking).toPromise().then((res) => {
			const resp = res as unknown as ApiResponse;
			if (resp.success && resp.data.id > 0) {
				const _booking = resp.data as unknown as BookingModel;
				//this.loadBookingFromService(_booking.id);

				const message = `Booking successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 10000, true, true);
				//this.refreshBooking(false);
			} else {
				const message = `An error occured while processing your request. Please try again later.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 10000, true, true);
			}
		}).catch((e) => {
			this.spinner.hide();
		}).finally(() => {
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
			window.scroll(0, 0);
			return;
		}
		let editedBooking = this.prepareBooking();

		const invoiceNumber = this.booking.invoiceNumber;
		const paymentStatus = +this.bookingForm.get('paymentStatusId').value;
		const paymentConcluded = +this.bookingForm.get('paymentConcludedId').value;
		const paymentMethod = +this.bookingForm.get('paymentMethodId').value;
		const bookingStatus = +this.bookingForm.get('bookingStatusId').value;

		if ((invoiceNumber == null && paymentStatus === 3 && paymentConcluded === 1 && paymentMethod !== 4) || (invoiceNumber === null && paymentStatus == 2 && (bookingStatus === 4 || bookingStatus === 6))) {
			console.log(true);

		} else {
			this.dialog.open(AlertDialogComponent, {
				width: '300px',
				data: { title: 'Create Invoice', message: 'This booking is not viable for invoicing.' }
			});
			return;
		}

		this.spinner.show();
		this.bookingService.updateBooking(editedBooking).toPromise().then((res) => {
			const resp = res as unknown as ApiResponse;
			if (resp.success && resp.data.id > 0) {
				const _booking = resp.data as unknown as BookingModel;

				this.invoiceService.createInvoiceFromBooking(this.booking.id).toPromise().then((res) => {
					this.spinner.hide();
					if (res.success) {
						this.layoutUtilsService.showActionNotification("Invoice is created successfully.", MessageType.Create, 5000, true);
						const url = `/invoice-management/invoices/edit/${res.data}`;
						this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
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

		const invoiceNumber = this.booking.invoiceNumber;
		const paymentStatus = +this.bookingForm.get('paymentStatusId').value;
		const paymentConcluded = +this.bookingForm.get('paymentConcludedId').value;
		const paymentMethod = +this.bookingForm.get('paymentMethodId').value;
		const bookingStatus = +this.bookingForm.get('bookingStatusId').value;

		if ((invoiceNumber == null && paymentStatus === 3 && paymentConcluded === 1 && paymentMethod !== 4) || (invoiceNumber === null && paymentStatus == 2 && (bookingStatus === 4 || bookingStatus === 6))) {


		} else {
			this.dialog.open(AlertDialogComponent, {
				width: '300px',
				data: { title: 'Create Invoice', message: 'This booking is not viable for invoicing.' }
			});
			return;
		}

		this.spinner.show();
		this.bookingService.updateBooking(editedBooking).toPromise().then((res) => {
			this.spinner.hide();

			const resp = res as unknown as ApiResponse;
			if (resp.success && resp.data.id > 0) {
				const dialogRef = this.dialog.open(BookingToInvoiceDialog, {
					width: '500px',
					height: '300px',
					data: this.booking
				});

				dialogRef.afterClosed().subscribe(result => {
					if (result) {
						this.layoutUtilsService.showActionNotification("Booking added to invoice successfully.", MessageType.Create, 5000, true);
						this.loadBookingFromService(this.booking.id);
					}
				});
			} else {
				const message = resp.errors[0];
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 10000, true, true);
			}
		}).catch(() => {
			this.spinner.hide();
			const message = `An error occured while processing your request. Please try again later.`;
			this.layoutUtilsService.showActionNotification(message, MessageType.Update, 10000, true, true);
		});
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
			window.scroll(0, 0);
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
								const url = `/booking-management/bookings/edit/${res.data}`;
								this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
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
					width: '370px',
					data: { cycles: 5 }
				});

				dialogRef.afterClosed().subscribe(result => {
					if (result) {
						this.spinner.show();
						this.bookingService.createCycle(this.booking.id, result).toPromise().then((res) => {
							this.spinner.hide();
							if (res.success) {
								this.layoutUtilsService.showActionNotification("Clone process completed successfully.", MessageType.Create, 3000, true);
								this.loadBookingFromService(res.data);
								//const url = `/booking-management/bookings/edit/${res.data}`;
								//this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });

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
		if (this.selectedTab == 0) {

			if (!this.booking || !this.booking.id) {
				return result;
			}
			result = `Edit booking - ${this.booking.name}`;
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
		this.loadLanguagesForFilter();
		this.loadCountriesFilter();
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
			this.relationshipsForFilter = data.map((el) => { return { id: el.id, value: el.relationships }; }).filter((e) => { if (e.value && e.value.length > 0) return e; });

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


		if (this.booking.insuranceCoverId !== undefined) {
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

			//this.filteredCountries = this.bookingForm.get('countryOfBirthId').valueChanges
			//	.pipe(
			//		startWith(''),
			//		map(value => this.filteredCountryOfBirth(value))
			//	);
			//if (this.booking.countryOfBirthId > 0) {
			//	var title = this.countriesForCountryOfBirthForFilter.find(x => x.id == this.booking.countryOfBirthId);
			//	if (title) {
			//		this.bookingForm.patchValue({ 'countryOfBirthId': { id: title.id, value: title.value } });
			//	}
			//}


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
		this.staticService.getServicesForFilter().toPromise().then(res => {
			this.servicesForFilter = res.data;

			this.filteredServices = this.bookingForm.get('serviceId').valueChanges
				.pipe(
					startWith(''),
					map(value => this._filterServices(value))
				);
			if (this.booking.serviceId > 0) {
				var service = this.servicesForFilter.find(x => x.id == this.booking.serviceId) as any;
				if (service) {
					this.bookingForm.patchValue({ 'serviceId': { id: service.id, value: service.value, vat: service.vat } });
					this.timedService = service.timeService;

					if (!service.timeService) {
						this.timedService = false;
						this.bookingForm.get('quantityHours').setValue(1);
						this.bookingForm.get('quantityHours').clearValidators();
					} else {
						this.timedService = true;
						this.bookingForm.get('quantityHours').setValidators([Validators.required, Validators.min(1), Validators.max(50)]);
					}

					var isPtFeeA1 = this.bookingForm.get('isPtFeeA1').value;
					if (isPtFeeA1 != undefined || isPtFeeA1 != null)
						this.bookingForm.patchValue({ 'isPtFeeA1': isPtFeeA1.toString() });

					var isProFeeA1 = this.bookingForm.get('isProFeeA1').value;
					if (isProFeeA1 != undefined || isProFeeA1 != null)
						this.bookingForm.patchValue({ 'isProFeeA1': isProFeeA1.toString() });
				}

				this.loadProfessionalsForFilter(this.booking.serviceId);
			}
		}).catch(() => {
			this.spinner.hide();
		}).finally(() => {
			this.spinner.hide();
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
			this.bookingForm.get('taxType').setValue(service.vat);

			if (!service.timeService) {
				this.timedService = false;
				this.bookingForm.get('quantityHours').setValue(1);
				this.bookingForm.get('quantityHours').clearValidators();
			} else {
				this.timedService = true;
				this.bookingForm.get('quantityHours').setValidators(Validators.required);
			}

		} else {
			this.professionalsForFilter = [];
			this.filteredProfessionals = new Observable<FilterModel[]>();
			this.bookingForm.patchValue({ 'professionalId': '' });
			this.bookingForm.get('taxType').setValue('');
		}
		this.updateAccountings();

	}

	professionalDrpClosed() {
		var professional = this.bookingForm.get('professionalId').value;
		if (professional) {
			this.bookingForm.get('ptFeeA1').setValue(professional.ptFees.a1);
			this.bookingForm.get('ptFeeA2').setValue(professional.ptFees.a1);
			this.bookingForm.get('proFeeA1').setValue(professional.proFees.a1);
			this.bookingForm.get('proFeeA2').setValue(professional.proFees.a1);
		} else {
			this.bookingForm.get('ptFeeA1').setValue('');
			this.bookingForm.get('ptFeeA2').setValue('');
			this.bookingForm.get('proFeeA1').setValue('');
			this.bookingForm.get('proFeeA2').setValue('');
		}
		this.updateAccountings();
	}

	// end services

	// Service Professionals
	loadProfessionalsForFilter(serviceId?: number) {
		this.staticService.getProfessionalsForFilter(serviceId).toPromise().then(res => {
			this.professionalsForFilter = res.data.filter(m => m.sid == serviceId);

			this.filteredProfessionals = this.bookingForm.get('professionalId').valueChanges
				.pipe(
					startWith(''),
					map(value => this._filterProfessionals(value))
				);
			if (this.booking.professionalId > 0) {
				var professional = this.professionalsForFilter.find(x => x.id == this.booking.professionalId);
				if (professional) {
					// @ts-ignore
					this.bookingForm.patchValue({ 'professionalId': { id: professional.id, value: professional.value, ptFees: professional.ptFees[0], proFees: professional.proFees[0] } });
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

		//if (this.bookingForm) {
		//	this.bookingForm.get('visitStartDate').valueChanges.subscribe((v) => {
		//		if (v) {
		//			let d = new Date(v);
					
		//			let newDate = new Date(d.getFullYear(), d.getMonth(), d.getDay(), d.getHours() + 1, d.getMinutes());
		//			this.bookingForm.get('visitEndDate').setValue(this.formatDate(newDate.toLocaleDateString()));
		//			this.bookingForm.get('visitEndTime').setValue(newDate);
		//			this.cdr.markForCheck();
		//		}
		//	});

		//	this.bookingForm.get('visitStartTime').valueChanges.subscribe((v) => {
		//		if (v) {
					

		//			this.bookingForm.get('visitEndTime').setValue(v);
		//		}
		//	});
		//}




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
		const val = this.bookingForm.get(control).value;
		if (val && val.id) return;
		this.bookingForm.get(control).setValue('');
		this.cdr.markForCheck();
	}

	/*End Closed events */



	detectChanges() {
		try {
			this.cdr.detectChanges();
		} catch (e) {

		}
	}

	tabChanged(event: MatTabChangeEvent) {
		this.tabTitle = event.tab.textLabel;
	}

}
