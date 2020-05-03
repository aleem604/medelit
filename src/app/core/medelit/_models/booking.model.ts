import { BaseModel } from '../../_base/crud';
import { eRecordStatus } from '../_enums/e-record-status.enum';

export class BookingModel extends BaseModel {
	id: number;
	customerId?: number;
	customerName: string;
	name: string;
	srNo: number;
	bookingName: string;
	invoiceEntityId: number;
	invoiceEntityName: string;
	bookingStatusId?: number = 1;
	bookingDate?: Date;
	bookingTypeId?: number;
	visitLanguageId?: number;
	visitVenueId?: number;
	visitVenueDetail: string;
	addressNotes: string;
	buzzer: string;
	visitRequestingPerson: string;
	visitRequestingPersonRelationId?: number;
	flatNumber?: number;
	floor?: number;
	buildingTypeId?: number;
	visitStreetName: string;
	homeStreetName: string;
	homePostCode: string;
	visitPostCode: string;
	homeCity: string;
	visitCity: string;
	phoneNumber: string;
	email: string;
	phone2: string;
	phone2Owner: string;
	dateOfBirth: Date;
	countryOfBirthId: number;
	homeCountryId?: number;
	visitCountryId?: number;
	details: string;
	diagnosis: string;
	reasonForVisit: string;
	imToProId?: number;
	mailToPtId?: number;
	ptCalledForAppointmentId?: number;
	paymentConcludedId?: number;
	paymentMethodId?: number;
	addToAccountingId?: number;
	paymentStatusId?: number;
	ccAuthorizationId?: number;
	bankTransfterReceiptId?: number;
	ccOwner: string;
	paymentArrivalDate?: Date;
	cashReturn?: number;
	invoiceNumber: string;
	invoicingNotes: string;
	invoiceDueDate: Date;
	notesOnPayment: string;
	reportDeliveredId?: number;
	addToProAccountId?: number;
	insuranceCoverId?: number;
	feedbackFromPro: string;
	proAvailabilityAskedId?: number;
	labCostsForMedelit?: number;
	dateOnPrescription?: Date;
	labId: number;
	lab: string;
	vials?: number;
	repeadPrescriptionNumber?: number;
	prescriptionNumber?: number;
	notes: string;
	privateFee?: number;
	ticketFee?: number;
	excemptionCode: string;
	nhsOrPrivateId?: number;
	
	taxAmount?: number;
	patientDiscount?: number;
	grossTotal?: number;
	isAllDayVisit: number;
	visitStartDate?: Date;
	visitEndDate?: Date;


	proDiscount?: number;
	cashConfirmationMailId?: number;
	
	//discountNetworkId?: number;
	patientAge?: number;
	cycle?: number;
	cycleNumber?: number;
	proInvoiceNumber: string;
	serviceId: number;
	professionalId: number;

	ptFeeId: number;
	ptFeeA1: number;
	ptFeeA2: number;
	isPtFeeA1: number;

	proFeeId: number;
	proFeeA1: number;
	proFeeA2: number;
	isProFeeA1: number;
	itemNameOnInvoice: string;

	quantityHours?: number;
	taxType?: number;
	subTotal?: number;
	totalDue?: number;
	totalPaid?: number;
	invoiceId?: number;

	status: eRecordStatus;
	createDate: Date;
	createdById: number;
	createdBy: string;
	updateDate: Date;
	updatedById: number;
	updatedBy: string;
	deletedAt: Date;
	deletedById: number;
	deletedBy: string;
    
	clear() {
		this.mailToPtId = 0;
		this.imToProId = 0;
	}
}


export interface BookingConnectedBookings {
	bookingName: string;
	service: string;
	professional: string;
	cycleNumber: number;
	fee: string;
	subTotal: number;
}

export interface BookingConnectedProfessionals {
	professional: string;
	phone: string;
	email: string;
	lastVisitDate: Date;
	activeNonActive: string;
}

export interface BookingConnectedInvoices {
	invoiceName: string
	invoiceNumber: string;
	invoiceEntity: string;
	invoiceDate: string;
	totalInvoice: number;
}
