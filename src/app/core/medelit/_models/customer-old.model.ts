import { BaseModel } from '../../_base/crud';
import { eRecordStatus } from '../_enums/e-record-status.enum';

export class CustomerModelOld extends BaseModel {
    userName: string;
    gender: string;
    ipAddress: string;
    type: number;
	dateOfBirth: string;
	id: number;
    firstName: string;
    lastName: string;
    email: string;
    status: any;
	


	clear() {

	}
}
