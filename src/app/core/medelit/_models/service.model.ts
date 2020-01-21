import { BaseModel } from '../../_base/crud';
import { eRecordStatus } from '../_enums/e-record-status.enum';


export class ServiceModel extends BaseModel {
	serviceCode: string;
	id: number;
	name: string;
	cycleId: number;
	activeServiceId: number;
	fieldId: number;
	field: string;
	subcategoryId: number;
	subCategory: string;
	durationId?: number;
	duration: string;
	timedServiceId: number;
	vatId?: number;
	vat: string;
	description: string;
	covermap: string;
	invoicingNotes: string;
	contractedServiceId?: number;
	refundNotes: string;
	informedConsentId?: number;
	tags: string;
	ptFeeId: number;
	ptFeeA1: null;
	ptFeeA2: null;

	proFeeId: number;
	proFeeA1: null;
	proFeeA2: null;

	status: eRecordStatus;
	assignedToId: number;
	assignedTo: string;
	createDate: Date;
	createdById: number;
	createdBy: string;
	deletedAt: Date;
	deletedById: number;
	deletedBy: string;
	professionals: number[];

	clear() {
		this.cycleId = 0;
		this.activeServiceId = 0;
		this.timedServiceId = 0;
		this.contractedServiceId = 0;
		this.informedConsentId = 0;
	}
}

export interface ServiceProfessionals {
	id: number;
	serviceId: number;
	service: ServiceModel;
	processionalId: number;
}


export interface ServiceProfessionalFeesModels {
	proId: number;
	proName: string;
	ptFeeId: number;
	ptFeeName: string;
	ptFeeA1: number;
	ptFeeA2: number;
	proFeeId: number;
	proFeeName: string;
	proFeeA1: number;
	proFeeA2: number;
}

export interface ServiceProfessionals {
	proName: string
	phone: string;
	email: string;
	status: string;
}

export interface ConnectedCustomersInvoicingEntities {
	customer: string;
	invoiceEntity: string;
	phoneNumber: string;
	email: string;
}

export interface ServiceConnectedBookings {
	bookingName: string;
	ServerWithFees: string;
	customer: string;
	invoiceEntity: string;
	visitDate: Date;
}

export interface ServiceConnectedCustomerInvoices {
	invoiceName: string;
	invoiceNumber: string;
	inoviceEntity: string;
	invoiceDate: Date;
	totalInvoice: number;
}

export interface ServiceConnectedLeads {
	serviceRequested: string;
	created: Date;
	lastChanged: Date;
	professional: string;
}
