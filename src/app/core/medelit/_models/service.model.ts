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

	status: eRecordStatus;
	assignedToId: number;
	assignedTo: string;
	updateDate: Date;
	createDate: Date;
	createdById: number;
	createdBy: string;
	deletedAt: Date;
	deletedById: number;
	deletedBy: string;

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
	id: number;
	pName: string;
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

export interface ServiceConnectedProfessionals {
	proName: string;
	phone: string;
	email: string;
	status: string;
}

export interface ConnectedCustomersInvoicingEntities {
	customer: string;
	invoiceEntity: string;
	phone: string;
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

export interface AttachProfessionalToServiceDialogModel {
	id: number;
	sid: number;
	pName: string;
	ptFeeId: number;
	ptFeeName: string;
	ptFeeA1: number;
	ptFeeA2: number;

	proFeeId: number;
	proFeeName: string;
	proFeeA1: number;
	proFeeA2: number;

}


export interface ServiceConnectedPtFeeModel {
	id: number;
	ptFeeId: number;
	professionals: string[];
	ptFeeName: string;
	ptFeeA1: number;
	ptFeeA2
}

export interface ServiceConnectedPtFeeDialogModel {
	id: number;
	ptFeeId: number;
	ptFeeName: string;
	ptFeeA1: number;
	ptFeeA2: number;
	professionals: string[];
	services: string[];
	tags: string[];
}


export interface ServiceConnectedProFeeModel {
	id: number;
	proFeeId: number;
	professionals: string[];
	proFeeName: string;
	proFeeA1: number;
	proFeeA2
}

export interface ServiceConnectedProFeeDialogModel {
	proFeeId: number;
	proFeeName: string;
	proFeeA1: number;
	proFeeA2: number;
	professionals: string[];
	services: string[];
	tags: string[];
}
