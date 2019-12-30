import { BaseModel } from '../../_base/crud';

export interface ApiResponse {
	data: any;
	success: boolean;
	items: any;
	totalCount: number;
	errorRepsonse: any;
	errors: string[];
}

export interface GridResponse {
	data: GridServerResponse;
	success: boolean;
	
}

export interface GridServerResponse {
	items: any[];
	total: number;
}


export class CityCreatedResponse extends BaseModel {
	id: number;
	name: string;
	shortName: string;
	fullName: string;
	code: string;
	imageUrl: string;
	description: string;
	status: number;
	countryId: number;
	regionId: number;
	data: number;
	success: boolean;
	errorRepsonse: any;

	clear() {
	this.id = 0;
	this.name = '';
	this.imageUrl = '';
	this.description = '';
	this.status = 0;
}
}

export interface LoginApiResponse {
	data: TokenResponse;
	success: boolean;
	items: any;
	totalCount: number;
	errorRepsonse: any;
}

export interface TokenResponse {
	accessToken: string;
	expiresIn: number,
	idToken: string;
	refreshToken: string;
}
