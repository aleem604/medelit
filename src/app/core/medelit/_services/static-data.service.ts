import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { QueryParamsModel, HttpUtilsService } from '../../_base/crud';
import { ApiResponse } from '..';


const API_STATIC_DATA_URL = environment.apiEndpoint + '/static';
// Real REST API
@Injectable()
export class StaticDataService {
       
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));

	constructor(private http: HttpClient,
		private httpUtils: HttpUtilsService) { }


	getApplicationMethodsForFilter(): Observable<ApiResponse> {
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/application-methods');
	}

	getApplicationMeansForFilter(): Observable<ApiResponse> {
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/application-means');
	}

	getContractStatusOptions(): Observable<ApiResponse> {
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/contract-status');
	}

	getDocumentListSentForFilter(): Observable<ApiResponse> {
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/document-list-sent');
	}
	
	getCollaborationCodes(): Observable<ApiResponse> {
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/collaboration-codes');
	}

	getStatuses(): Observable<ApiResponse> {
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/statuses');
	}

	getTitlesForFilter(): any {
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/titles');
	}

	getLanguagesForFilter(): any {
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/languages');
	}

	getCitiesForFilter(): any {
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/cities');
	}

	getCountriesForFilter(): any {
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/countries');
	}

	getRelationshipsForFilter(): any {
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/relationships');
	}

	getAccountingCodesForFilter(): any {
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/accounting-codes');
	}

	getFieldsForFilter(): any {
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/fields');
	}

	getCategoriesForFilter(): any {
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/categories');
	}

	getDurationsForFilter(): any {
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/durations');
	}

	getVatsForFilter(): any {
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/vats');
	}

	getPTFeesForFilter(): any {
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/ptfees');
	}

	getPROFeesForFilter(): any {
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/profees');
	}

	getProfessionalsForFilter(): any {
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/professionals');
	}
}
