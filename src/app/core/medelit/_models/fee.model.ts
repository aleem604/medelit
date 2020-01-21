import { BaseModel } from '../../_base/crud';
import { eRecordStatus } from '../_enums/e-record-status.enum';
import { eFeeType } from '../_enums/e-fee-type.enum';


export class FeeModel extends BaseModel {
	id: number;
	feeName: string;
	feeCode: string;
	feeTypeId: number = eFeeType.PTFee;
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

export class FeeDialogModel {
	serviceId: number;
	ptFeeId: number;
	ptFeeName: string;
	ptFeeA1: number;
	ptFeeA2: number;
	ptFeeTags: string;

	proFeeId: number;
	proFeeName: string;
	proFeeA1: number;
	proFeeA2: number
	proFeeTags: string;
}

export interface ConnectedProfessionalsCustomersModel {
	feeId: number;
	feeTypeId: number;
	feeType: string;
	feeName: string;
	sName: string;
	proName: string;
	feeA1: number;
	feeA2: number;
}

export interface ConnectedServicesModel {
	serviceName: string;
	pTFeeId: number;
	fieldId: number;
	field: string;
	subCategory: string;
}


export interface AttachServiceToFeeDialogModel {
	id: number;
	feeTypeId: number;
	feeName: string;
	sName: string;
	proName: [],
	feeA1: number;
	feeA2: number;
}
