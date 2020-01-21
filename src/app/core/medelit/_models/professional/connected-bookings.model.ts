import { InvoiceEntityModel } from '../invoice-entity.model';

export interface ConnectedBookings {
	bookingId: number;
	bookingName: string;
	customerName: string;
	inoviceEntity: InvoiceEntityModel,
	lastVisitDate: Date;
}
