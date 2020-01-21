
export interface ConnectedCustomers {
	customer: string;
	phoneNumber: string;
	email: string;
	lastVisitDate: string;
	lastBookedService: string;
	lastBookedServiceFees: string;
}

export interface ConnectedInvoices {
	invoiceName: string;
	invoiceNumber: string;
	invoiceEntity: string;
	invoiceDate: Date;
	totalInvoice: number;
}

export interface ConnectedLeads {
	service: string;
	createDate: Date;
	updateDate: Date;
	leadStatusId: number;
	leadStatus: string;
	professional: string;
}


export interface CustomerConnectedCustomers {
	title: string;
	name: string;
	email: string;
	mainPhone: string;
}

export interface CustomerConnectedServices {
	serviceName: string;
	ptFee: string;
	ptFeeA1: number;
	ptFeeA2: number;
	proFee: string;
	proFeeA1: string;
	proFeeA2: string;
	proName: string;
	service: string;
}

export interface CustomerConnectedProfessionals {
	proName: string;
	phone: string;
	email: string;
	visitStartDate: Date;
	activeCollaborationId: number;
	status: string;
}

export interface CustomerConnectedBookings {
	bookingName: string;
	serviceName: string;
	ptFee: string;
	ptFeeA1: number;
	ptFeeA2: number;
	proFee: string;
	proFeeA1: number;
	proFeeA2: number;
	proName: string;
	service: string;
}

export interface CustomerConnectedInvocies {
	subject: string;
	invoiceNumber: string;
	ieName: string;
	invoiceDate: Date;
	totalInvoice: number;
}

export interface CustomerConnectedLeads {
	leadName: string;
	createDate: Date;
	updateDate: Date;
	professional: string;
	leadStatusId: number;
}
