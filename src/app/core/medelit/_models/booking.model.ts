import { BaseModel } from '../../_base/crud';
import { eRecordStatus } from '../_enums/e-record-status.enum';
import { NumericDictionary } from 'lodash';

export class BookingModel extends BaseModel {
	id: number;
	name: string;
	invoiceEntityId: number;
	bookingStatusId?: number;
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
	homeCityId?: number;
	visitCityId?: number;
	phoneNumber: string;
	email: string;
	email2: string;
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
	lab: string;
	vials?: number;
	repeadPrescriptionNumber?: number;
	prescriptionNumber?: number;
	notes: string;
	privateFee?: number;
	ticketFee?: number;
	excemptionCode: string;
	nhsOrPrivateId?: number;
	taxType?: number;
	subTotal?: number;
	taxAmount?: number;
	patientDiscount?: number;
	grossTotal?: number;
	visitDate?: Date;
	visitTime?: any;
	proDiscount?: number;
	cashConfirmationMailId?: number;
	quantityHours?: number;
	discountNetworkId?: number;
	patientAge?: number;
	cycle?: number;
	cycleNumber?: number;
	proInvoiceNumber: string;
	bookingTime?: Date;
	totalDue?: number;
	totalPaid?: number;
	customerId?: number;
	services: BookingServicesModel[];

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
		this.imToProId = 0;

		this.services = [];

	}

}

export class BookingServicesModel {
	id: number;
	bookingId: number;
	serviceId: number;
	professionalId: number;
	ptFeeId: number;
	ptFeeA1: number;
	ptFeeA2: number;
	proFeeId: number;
	proFeeA1: number;
	proFeeA2: number;
}
