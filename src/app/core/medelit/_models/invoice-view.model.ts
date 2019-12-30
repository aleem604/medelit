import { BookingModel } from './booking.model';
import { InvoiceModel, BookingViewModel } from './invoice.model';

export class InvoiceView {
	id: number;
	subject: string;
	paymentMethodId: number;
	paymentMethod: string;
	statusId: number;
	status: string;
	dueDate: Date;
	paymentDue: Date;
	totalInvoice: number;
	invoiceNumber: string;
	// customer
	bankName: string;
	sortCode: string;
	accountNumber: string;
	customerId: number;
	surName: string;
	name: string;
	homePostCode: string;
	city: string;
	country: string;
	bookings: BookingViewModel[];
}

