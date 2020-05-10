import { BaseModel } from '../../_base/crud';
import { eRecordStatus } from '../_enums/e-record-status.enum';


export class InvoiceEntityModel extends BaseModel {
	id: number;
	ieNumber: string;
	name: string;
	mainPhoneNumber: string;
	mainPhoneNumberOwner: string;
	phone2: string;
	phone2Owner: string;
	email: string;
	phone3: string;
	phone3Owner: string;
	email2: string;
	ratingId: number;
	rating: string;
	relationshipWithCustomerId: number;
	relationshipWithCustomer: string;
	ieTypeId: number;
	ieType: string;
	fax: string;
	dateOfBirth: string;
	countryOfBirthId: number;
	countryOfBirth: string;
	billingAddress: string;
	mailingAddress: string;
	billingPostCode: string;
	billingCity: string = 'London';
	mailingCity: string = 'London';
	billingCountryId: number;
	billingCountry: string;
	mailingCountryId: number;
	mailingCountry: string;
	mailingPostCode: string;
	description: string;
	vatNumber: number;
	vat: string;
	paymentMethodId: number;
	paymentConditions: string;
	bank: string;
	accountNumber: string;
	sortCode: string;
	iban: string;
	insuranceCoverId: number;
	invoicingNotes: string;
	discountNetworkId: number;
	listedDiscountNetwork: string;
	personOfReference: string;
	personOfReferenceEmail: string;
	personOfReferencePhone: string;
	contractedId: number;
	blackListId: number;
	discountPercent: number;

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
	assignedToId: number;
	assignedTo: string;

	clear() {
	}
}

export interface InvoiceEntityConnectedServices {
	serviceName: string;
	ptFeeName: string;
	proFeeName: string;
	proFee: number;
	professional: string;
	service: string;
}

export interface InvoiceEntityConnectedCustomers {
	customer: string;
	phone: string;
	email: string;
	services: string;
	visitDate: Date;
	professional: string;
}

export interface InvoiceEntityConnectedProfessionals {
	professional: string;
	phone: string;
	email: string;
	visitDate: Date;
	activeCollaborationId: number;
	status: string;
}

export interface InvoiceEntityConnectedBookings {
	bookingName: string;
	service: string;
	professional: string;
	visitDate: Date;
}

export interface InvoiceEntityConnectedInvoices {
	subject: string;
	invoiceNumber: string;
	ieName: string;
	invoiceDate: Date;
	totalInvoice: number;
}

export interface InvoiceEntityConnectedLeads {
	services: any[];
	invoiceNumber: Date;
	professional: string[];
	leadStatusId: number;
	status: string;
}
