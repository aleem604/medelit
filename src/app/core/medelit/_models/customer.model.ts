import { BaseModel } from '../../_base/crud';
import { eRecordStatus } from '../_enums/e-record-status.enum';

export class CustomerModel extends BaseModel {
	id: number;
	titleId: number;
	title: string;
	surName: string;
	name: string;
	languageId: number;
	mainPhone: string;
	mainPhoneOwner: string;
	phone2: string;
	phone2Owner: string;
	phone3: string;
	phone3Owner: string;
	contactPhone: string;
	email: string;
	email2: string;
	fax: string;
	dateOfBirth?: Date;
	countryOfBirthId?: number;
	visitRequestingPerson: string;
	visitRequestingPersonRelationId?: number;
	homeStreetName: string;
	visitStreetName: string;
	homeCityId: number;
	visitCityId: number;
	homePostCode: string;
	visitPostCode: string;
	homeCountryId?: number;
	visitCountryId?: number;
	gpCode: string;
	visitVenueId?: number;
	visitVenueDetail: string;
	buzzer: string;
	flatNumber?: number;
	floor?: number;
	buildingTypeId?: number;
	contactMethodId?: number;
	addressNotes: string;
	listedDiscountNetworkId?: number;
	discount?: number;
	bankName: string;
	accountNumber: string;
	sortCode: string;
	iban: string;
	insuranceCoverId?: number;
	haveDifferentIEId: number;
	invoiceEntityId?: number;
	paymentMethodId?: number;
	invoicingNotes: string;
	blacklistId?: number;
	leadId?: number;


	status: eRecordStatus;
	crateDtae: Date;
	createdBy: string;
	updateDate: Date;
	updatedBy: string;
	deleteDate: Date;
	deletedBy: string;
	services: CustomerServicesModel[];

	clear() {
		this.services = [];
	}
}

export class CustomerServicesModel {
	id: number;
	customerId: number;
	serviceId: number;
	professionalId: number;
	ptFeeId: number;
	ptFeeA1: number;
	ptFeeA2: number;
	proFeeId: number;
	proFeeA1: number;
	proFeeA2: number;
}
