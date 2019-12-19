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
	dueDate: Date;
	invoiceDate: Date;
	subTotal?: number;
	taxCodeId?: number;
	taxAmount?: number;
	discount?: number;
	totalInvoice?: number;
	statusId?: number;
	paymentDue?: Date;
	invoiceDeliveryDate: Date;
	invoiceSentByEmailId?: number;
	invoiceSentByMailId?: number;
	paymentMethodId: number;
	patientDateOfBirth?: Date;
	ieBillingAddress: string;
	mailingAddress: string;
	ieBillingPostCode: string;
	mailingPostCode: string;
	ieBillingCityId?: number;
	mailingCityId?: number;
	ieBillingCountryId?: number;
	mailingCountryId?: number;
	invoiceNotes: string;
	insuranceCoverId?: number;
	invoiceDiagnosis: string;
	dateOfVisit?: Date;
	termsAndConditions: string;
	invoiceDescription: string;
	itemNameOnInvoice: string;
	quantity?: number;
	paymentArrivalDate?: Date;
	proInvoiceDate?: Date;
	assignedToId?: number;
	services: InvoiceServicesModel[];

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
		this.services = [];


	}
}

export class InvoiceServicesModel {
	id: number;
	invoiceId: number;
	serviceId: number;
	professionalId: number;
	ptFeeId: number;
	ptFeeA1: number;
	ptFeeA2: number;
	ptFeeCustom: number;
	proFeeId: number;
	proFeeA1: number;
	proFeeA2: number;
	proFeeCustomer: number;
}
