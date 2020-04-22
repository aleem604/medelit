import { BaseModel } from '../../../_base/crud';
import { eRecordStatus } from '../../_enums/e-record-status.enum';
import { FilterModel } from '../filter.model';

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
	leadStatusId?: number = 1;
	leadStatus: string;
	languageId?: number = 1015;
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
	cityId?: number = 1002;
	city: string;
	countryId?: number = 1022;
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
	serviceSearchCtrl: FilterModel;
	professionalId: number;
	professionalSearchCtrl: FilterModel;
	isPtFeeA1: number = 1;
	ptFeeId: number;
	ptFeeA1: number;
	ptFeeA2: number;
	
	proFeeId: number;
	isProFeeA1: number = 1;
	proFeeA1: number;
	proFeeA2: number;

}
