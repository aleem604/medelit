import { BaseModel } from '../../_base/crud';
import { eRecordStatus } from '../_enums/e-record-status.enum';

export class FeeModel  extends BaseModel {
	id: number;
	feeName: string;
	feeCode: string;
	feeTypeId: number;
	feeType: string;
	fields: string;
	subCategory: string;
	taxes: string;
	connectedServices: string;
	connectedProgessionals: string;
	tags: string;
	a1: number;
	a2: number;

	status: eRecordStatus;
	createDate: Date;
	createdBy: string;
	updateDate: Date;
	updatedBy: string;
	deletedAt: Date;
	deletedBy: string;


	clear() {
		
	}
}
