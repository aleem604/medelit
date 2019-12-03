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

	
	getStatuses(): Observable<ApiResponse> {
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/statuses');
	}

	getTitlesForFilter(): any {
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/titles');
	}

	getLanguagesForFilter(): any {
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/languages');
	}

	getCountriesForFilter(): any {
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/countries');
	}

	getRelationshipsForFilter(): any {
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/relationships');
	}
}
