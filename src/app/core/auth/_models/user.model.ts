import { BaseModel } from '../../_base/crud';
import { Address } from './address.model';
import { SocialNetworks } from './social-networks.model';

export class User extends BaseModel {
    id: string;
	userName: string;
	firstName: string;
	lastName: string;
    password: string;
    email: string;
    accessToken: string;
    refreshToken: string;
	roles: string[];
    pic: string;
    fullname: string;
    occupation: string;
	companyName: string;
	phoneNumber: string;
    address: Address;
    socialNetworks: SocialNetworks;

    clear(): void {
        this.id = undefined;
        this.userName = '';
        this.password = '';
        this.email = '';
        this.roles = [];
        this.fullname = '';
        this.accessToken = '';
        this.refreshToken = '';
        this.pic = './assets/media/users/default.jpg';
        this.occupation = '';
        this.companyName = '';
        this.phoneNumber = '';
    }
}
