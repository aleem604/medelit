import { BaseModel } from '../../_base/crud';
import { eRecordStatus } from '../_enums/e-record-status.enum';

export class LeadModel extends BaseModel {
	id: number;
	surName: string;
	titleId?: number;
	title: string;
	name: string;
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
	leadSourceId?: number;
	leadSource: string;
	leadStatusId?: number;
	leadStatus: string;
	languageId?: number;
	language: string;
	leadCategoryId?: number;
	leadCategory: string;
	contactMethod?: number;
	dateOfBirth?: Date;
	countryOfBirthId?: number;
	countryOfBirth: string;
	preferredPaymentMethodId?: number;
	preferredPaymentMethod: string;
	invoicingNotes: string;
	insuranceCover?: boolean;
	listedDiscountNetworkId?: number;
	listedDiscountNetwork: string;
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
	fromCustomerId?: number;
	fromCustomer: string;
	convertDate?: Date;
	services: LeadServices[];

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
		this.titleId = 0;
		this.name = '';
		this.email = '';
		this.mainPhone = '';
		this.phone2 = '';
		this.phone2Owner = '';
		this.phone3 = '';
		this.phone3Owner = '';
	}
}

export interface LeadServices {
	id: number;
	serviceId: null;
	professionals: number[];
	ptFeeA1: number;
	ptFeeA2: number;
	proFeeA1: number;
	proFeeA2: number;
}
