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
	city: string = 'London';
	postCode: string;
	countryId: number = 1022;
	description: string;
	clinicStreetName: string;
	clinicPostCode: string;
	clinicCity:string = 'London';
	clinicPhoneNumber: string;
	dateOfBirth: string;
	companyName: string;
	companyNumber: string;
	invoicingNotes: string;
	bank: string;
	branch: string;
	accountName: string;
	accountNumber: string;
	sortCode: string;
	contractDate: string;
	contractEndDate: string;
	workPlace: string;
	colleagueReferring: string;
	insuranceExpiryDate: string;
	activeCollaborationId: any;
	clinicAgreement: any;
	applicationMethodId: any;
	applicationMeansId: any;
	firstContactDate: string;
	lastContactDate: string;
	contractStatusId: number;
	contractStatus: string;
	documentListSentId: any;
	calendarActivation: any;
	proOnlineCV: string;
	protaxCodeId: number;

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
	languages: string[];

	clear() {
		this.name = '';
		this.email = '';
	}
}
