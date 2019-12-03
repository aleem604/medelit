import { BaseModel } from '../../_base/crud';
import { eRecordStatus } from '../_enums/e-record-status.enum';


export class ServiceModel extends BaseModel {
	id: number;
	name: string;
	cycle: boolean;
	active: boolean;
	fieldId: number;
	field: string;
	subCategoryId: number;
	subCategory: string;
	durationId: never;
	duration: string;
	taxes: number;
	coverMap: string;
	contractedServices: boolean;
	refundNotes: string;
	informedConsent: boolean;
	ptFeeId: number;
	ptFee: string;
	proFeeId: number;
	proFee: string;
	pros: string;
	tags: string;
	status: eRecordStatus;
	assignedToId: number;
	assignedTo: string;
	createDate: Date;
	createdById: number;
	createdBy: string;
	deletedAt: Date;
	deletedById: number;
	deletedBy: string;

	clear() {
		this.id = 0;
		this.name = '';
		this.field = '';
		this.subCategory = '';
	}
}
