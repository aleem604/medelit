import { BaseModel } from '../../_base/crud';
import { eRecordStatus } from '../_enums/e-record-status.enum';

export class ProfessionalModel extends BaseModel {
	id: number;
	code: string;
	titleId: number;
	title: string;
	name: string;
	surname: string;
	email: string;
	telephone: string;
	accountingCodeId: number;
	accountingCode: string;
	website: string;
	mobilePhone: string;
	homePhone: string;
	email2: string;
	coverMap: string;
	streetName: string;
	cityId: number;
	city: string;
	postCode: string;
	countryId: number;
	country: string;
	description: string;
	clinicStreetName: string;
	clinicPostCode: string;
	clinicCityId: number;
	clinicCity: string;
	clinicPhoneNumber: string;
	dateOfBirth: Date;
	companyName: string;
	invoicingNotes: string;
	bank: string;
	branch: string;
	accountName: string;
	sortCode: string;
	contractDate: Date;
	contractEndDate: Date;
	workPlace: string;
	cleagueReferring: string;
	activeCollaborationId: number;
	activeCollaboration: string;
	clinicAgreement: boolean;
	applicationMethodId: number;
	applicationMethod: string;
	firstContactDate: Date;
	lastContactDate: Date;
	contractStatusId: number;
	contractStatus: string;
	documentListSentId: number;
	calendarListSentId: number;
	proOnlineCV: string;
	proTaxCode: string;

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
		this.titleId = 0;
		this.name = '';
		this.email = '';

	}
}
