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
	professionalId: number;
	ptFeeRowId: number;
	ptFeeId: number;
	ptFeeName: string;
	ptFeeA1: number;
	ptFeeA2: number;
	ptFeeTags: string;

	proFeeRowId: number;
	proFeeId: number;
	proFeeName: string;
	proFeeA1: number;
	proFeeA2: number
	proFeeTags: string;
}

export interface FeeConnectedProfessionalsModel {
	id: number;
	prfessionalId: number;
	serviceId: number;
	pName: string;
	pCity: string;
	service: string;
	field: string;
	subCategory: string;
}

export interface ProfessionalConnectedServicesModel {
	id: number;
	proId: number;
	serviceId: number;
	professionalId: number;
	cService: string;
	cField: string;
	cSubcategory: string;
	ptFeeRowId: number;
	ptFeeId: number;
	ptFeeName: string;
	ptFeeA1: number;
	ptFeeA2: number;

	proFeeRowId: number;
	proFeeId: number;
	proFeeName: string;
	proFeeA1: number;
	proFeeA2: number;

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


export interface AttachProToFeeDialogModel {
	id: number;
	pName: string;
	pCity: string;
	sName: string;
	sField: string;
	sSubcategory: string;
}

export class AddFeeToServiceDialogModel {
	id: number;
	sName: string;
	ptFeeId: number;
	ptFeeName: string;
	ptFeeA1: null;
	ptFeeA2: null;

	proFeeId: number;
	proFeeName: string;
	proFeeA1: null;
	proFeeA2: null;

    ptFeeTags: string;
    proFeeTags: string;
}

export interface AttachFeesToProServiceDialogModel {
	serviceId: number;
	professionalId: number;
}

