import { BaseModel } from '../../_base/crud';
import { eRecordStatus } from '../_enums/e-record-status.enum';

export class InvoiceModel extends BaseModel {
	id: number;
	invoiceNumber: string;
	subject: string;
	bookingId?: number;
	invocingEntityId?: number;
	customerId: number;
	dueDate?: Date;
	invoiceDate?: Date;
	subTotal?: number;
	taxCodeId?: number;
	taxAmount?: number;
	discount?: number;
	totalInvoice?: number;
	invoiceStatusId?: number;
	paymentDue?: Date;
	invoiceDeliveryDate?: Date;
	invoiceSentByEmail?: boolean;
	invoiceSentByMail?: boolean;
	paymentMethodId?: number;
	patientDOB?: Date;
	ieBillingAddress: string;
	mailingAddress: string;
	iePostCode: string;
	mailingPostCode: string;
	ieCityId?: number;
	mailingCityId?: number;
	ieBillingCountryId?: number;
	mailingCountryId?: number;
	invoiceNotes: string;
	insuranceCoverId?: number;
	invoiceDiagnosis: string;
	dateOfVist?: Date;
	termsAndConditions: string;
	invoiceDescription: string;
	itemNameOnInvoice: string;
	quantity?: number;
	paymentArrivalDate?: Date;
	proInvoiceDate?: Date;
	assignedToId?: number;
	status: eRecordStatus;
	createDate: Date;
	createdById?: number;
	updateDate?: Date;
	updatedById?: number;
	deletedAt?: Date;
	deletedById?: number;

	clear() {


	}
}
