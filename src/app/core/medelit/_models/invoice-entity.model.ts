import { BaseModel } from '../../_base/crud';
import { eRecordStatus } from '../_enums/e-record-status.enum';

export class InvoiceEntityModel extends BaseModel {
	id: number;
	ieNumber: string;
	name: string;
	mainPhoneNumber: string;
	mainPhoneNumberOwner: string;
	phone2: string;
	phone2Owner: string;
	email: string;
	phone3: string;
	phone3Owner: string;
	email2: string;
	ratingId: number;
	rating: string;
	relationshipWithCustomerId: number;
	relationshipWithCustomer: string;
	ieTypeId: number;
	ieType: string;
	fax: string;
	dateOfBirth: Date;
	countryOfBirthId: number;
	countryOfBirth: string;
	billingAddress: string;
	mailingAddress: string;
	billingPostCode: string;
	billingCityId: number;
	billingCity: string;
	mailingCityId: number;
	mailingCity: string;
	billingCountryId: number;
	billingCountry: string;
	mailingCountryId: number;
	mailingCountry: string;
	mailingPostCode: string;
	description: string;
	vatNumber: number;
	vat: string;
	paymentMethodId: number;
	paymentConditions: string;
	bank: string;
	accountNumber: string;
	sortCode: string;
	iban: string;
	insuranceCoverId: number;
	invoicingNotes: string;
	discountNetworkId: number;
	listedDiscountNetwork: string;
	personOfReference: string;
	personOfReferenceEmail: string;
	personOfReferencePhone: string;
	blackListId: number;
	discountPercent: number;

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
	assignedToId: number;
	assignedTo: string;

	clear() {
	}
}
