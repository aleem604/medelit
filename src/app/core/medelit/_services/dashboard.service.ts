// Angular
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// RxJS
import { Observable } from 'rxjs';
// CRUD
import { HttpUtilsService } from '../../_base/crud';
// Models
import { LeadModel } from '..';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../_models/apireponse.model';


const API_DASHBOARD_URL = `${environment.apiEndpoint}/dashboard`;

@Injectable()
export class DashboardService {
	constructor(private http: HttpClient, private httpUtils: HttpUtilsService) { }

	getStats(): Observable<ApiResponse> {
		return this.http.get<ApiResponse>(API_DASHBOARD_URL + '/stats');
	}

}
