import { BaseModel } from '../../../_base/crud';
import { eRecordStatus } from '../../_enums/e-record-status.enum';
import { ServiceProfessionals } from './../service.model';

export class ProfessionalModel extends BaseModel {
	id: number;
	code: string;
	titleId: number;
	title: string;
	name: string;
	professionalLanguages: string[];
	professionalFields: string[];
	professionalSubCategories: string[];
	email: string;
	telephone: string;
	accountingCodeId: number;
	website: string;
	mobilePhone: string;
	homePhone: string;
	email2: string;
	fax: string;
	coverMap: string;
	streetName: string;
	cityId: number = 1002;
	postCode: string;
	countryId: number = 1003;
	description: string;
	clinicStreetName: string;
	clinicPostCode: string;
	clinicCityId?: number = 1002;
	clinicPhoneNumber: string;
	dateOfBirth: Date;
	companyName: string;
	companyNumber: string;
	invoicingNotes: string;
	bank: string;
	branch: string;
	accountName: string;
	accountNumber: string;
	sortCode: string;
	contractDate?: Date;
	contractEndDate?: Date;
	workPlace: string;
	colleagueReferring: string;
	insuranceExpiryDate: Date;
	activeCollaborationId: number;
	clinicAgreement: number;
	applicationMethodId: number;
	applicationMeansId: number;
	firstContactDate: Date;
	lastContactDate?: Date;
	contractStatusId: number;
	contractStatus: string;
	documentListSentId: number;
	calendarActivation: number;
	proOnlineCV: string;
	proTaxCodeId: number;

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
	professionalServices: ServiceProfessionals[];

	clear() {
		this.clinicAgreement = 0;
		this.applicationMethodId = 0;
		this.calendarActivation = 0;
		this.name = '';
		this.email = '';

	}
}
