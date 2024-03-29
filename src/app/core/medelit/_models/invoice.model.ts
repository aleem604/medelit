import { BaseModel } from '../../_base/crud';
import { eRecordStatus } from '../_enums/e-record-status.enum';

export class InvoiceModel extends BaseModel {
	id: number;
	subject: string;
	invoiceEntityId?: number;
	invoiceEntity: string;
	customerId?: number;
	customer: string;
	invoiceNumber: string;
	dueDate: string;
	invoiceDate: string;

	statusId?: number;
	paymentDueDate?: string;
	invoiceDeliveryDate: string;
	invoiceSentByEmailId?: number = 0;
	invoiceSentByMailId?: number = 0;
	paymentMethodId: number;
	patientDateOfBirth?: string;
	ieBillingAddress: string;
	mailingAddress: string;
	ieBillingPostCode: string;
	mailingPostCode: string;
	ieBillingCity: string;
	mailingCity: string;
	ieBillingCountryId?: number;
	mailingCountryId?: number;
	invoiceNotes: string;
	insuranceCoverId?: number;
	invoiceDiagnosis: string;
	dateOfVisit?: string;
	termsAndConditions: string;
	invoiceDescription: string;
	itemNameOnInvoice: string;
	paymentArrivalDate?: string;
	proInvoiceDate?: string;

	subTotal?: number;
	discount?: number;
	totalInvoice?: number;
	isProforma: boolean;

	invoiceBookingView: InvoiceBookings[];
	assignedToId?: number;
	status: eRecordStatus;
	createDate: Date;
	createdById?: number;
	updateDate?: Date;
	updatedById?: number;
	deletedAt?: Date;
	deletedById?: number;


	clear() {
		this.invoiceSentByEmailId = 0;
		this.invoiceSentByMailId = 0;
		this.statusId = 2;

	}
}

export class InvoiceBookings {
	id: number;
	invoiceId: number;
	bookingId: number;
	booking: BookingViewModel;
}

export class BookingViewModel {
	id: number;
	name: string;
	customerId: number;
	customerName: string;
	invoiceEntityId: number;
	invoiceEntity: string;
	cycle: number;
	cycleNumber: number;
	subTotal: number;
	taxCodeId?: number;
	taxAmount?: number;
}

export interface InvoiceConnectedProfessionals {
	proName: string;
	phone: string;
	email: string;
	visitStartDate: Date;
	activeCollaborationId: number;
	status: string;
}

export interface InvoiceConnectedCustomers {
	customer: string;
	phoneNumber: string;
	email: string;
	service: string;
	visitDate: Date;
	professional: string;
}

export interface InvoiceConnectedInvoiceEntities {
	invoiceEntity: string;
	customer: string;
	phoneNumber: string;
	email: string;
	service: string;
	visitDate: Date;
	professional: string;
}

export interface InvoiceConnectedBookings {
	bookingName: string;
	service: string;
	professional: string;
	proFee: number;
	visitDate: Date;
}


export interface BookingsToAddToInvoiceDialogModel{
	id: number,
	name: string;
	phoneNumber: string;
	feeName:string
}

export interface EditInvoiceBookingsViewModel {
	id: number;
	bookingName: string;
	serviceName: string;
	itemNameOnInvoice: string;
	quantityHours: string;
	feeName: string;
	taxes: string;
	subTotal: string;
	discount: string;
	total: string;
	inoviceTotal: string;
}
