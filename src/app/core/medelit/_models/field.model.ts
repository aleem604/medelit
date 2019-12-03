import { BaseModel } from '../../_base/crud';
import { eRecordStatus } from '../_enums/e-record-status.enum';


export class FieldModel extends BaseModel {
	id: number;
	code: string;
	field: string;
	subCategory: string;
	status: eRecordStatus;


	clear() {
		this.id = 0;
		this.code = '';
		this.field = '';
		this.subCategory = '';
	}
}
