import { BaseModel } from '../../_base/crud';
import { eRecordStatus } from '../_enums/e-record-status.enum';

export class LeadModel extends BaseModel {
	id: number;
	surName: string;
	titleId?: number;
	title: string;
	name: string;
	requestedServiceId: number;
	professionalId: number;
	professionals: number[];
	ptFeeId: number;
	ptFeeA1: number;
	ptFeeA2: number;
	ptFeeCustom: number;
	proFeeId: number;
	proFeeA1: number;
	proFeeA2: number;
	proFeeCustom: number;

	invoiceEntityId?: number;
	invoiceEntity: string;
	mainPhone: string;
	mainPhoneOwner: string;
	phone2: string;
	phone2Owner: string;
	phone3: string;
	phone3Owner: string;
	contactPhone: string;
	visitRequestingPerson: string;
	visitRequestingPersonRelationId?: number;
	fax: string;
	email: string;
	email2: string;
	leadSourceId?: number;
	leadSource: string;
	leadStatusId?: number;
	leadStatus: string;
	languageId?: number;
	language: string;
	leadCategoryId?: number;
	leadCategory: string;
	contactMethodId?: number;
	dateOfBirth?: Date;
	countryOfBirthId?: number;
	countryOfBirth: string;
	preferredPaymentMethodId?: number;
	preferredPaymentMethod: string;
	invoicingNotes: string;
	insuranceCoverId?: number;
	listedDiscountNetworkId?: number;
	listedDiscountNetwork: string;
	haveDifferentIEId: number;
	discount?: number;
	gpCode: string;
	addressStreetName: string;
	postalCode: string;
	cityId?: number;
	city: string;
	countryId?: number;
	country: string;
	buildingTypeId?: number;
	buildingType: string;
	flatNumber?: number;
	buzzer: string;
	floor?: number;
	visitVenueId?: number;
	visitVenue: string;
	addressNotes: string;
	visitVenueDetail: string;
	leadDescription: string;
	convertDate?: Date;
	services: LeadServicesModel[];
	bankName: string;
	accountNumber: string;
	sortCode: string;
	iban: string;
	blacklistId: number;
	fromCustomerId?: number;
	fromCustomer: string;
	customerId?: number;
	customer: string;



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
		this.haveDifferentIEId = 0;
		this.blacklistId = 0;
		this.leadStatusId = 1;
		this.services = [];
	}
}

export class LeadServicesModel {
	id: number;
	leadId: number;
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
