import { BaseModel } from '../../_base/crud';

export class Role extends BaseModel {
    id: string;
    name: string;
    isCoreRole = false;

    clear(): void {
        this.id = '';
        this.name = '';
        this.isCoreRole = false;
	}
}
