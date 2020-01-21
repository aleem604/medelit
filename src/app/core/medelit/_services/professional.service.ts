// Angular
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// RxJS
import { Observable } from 'rxjs';
// CRUD
import { HttpUtilsService, QueryParamsModel, QueryResultsModel } from '../../_base/crud';
// Models
import { ProfessionalModel } from '..';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../_models/apireponse.model';


const API_PROFESSIONALS_URL = `${environment.apiEndpoint}/professionals`;

@Injectable()
export class ProfessionalsService {
	constructor(private http: HttpClient, private httpUtils: HttpUtilsService) { }

	// CREATE =>  POST: add a new professional to the server
	createProfessional(professional: ProfessionalModel): Observable<ProfessionalModel> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<ProfessionalModel>(API_PROFESSIONALS_URL, professional, { headers: httpHeaders });
	}

	// READ
	getAllProfessionals(): Observable<ProfessionalModel[]> {
		return this.http.get<ProfessionalModel[]>(API_PROFESSIONALS_URL);
	}

	getProfessionalById(professionalId: number): Observable<ProfessionalModel> {
		return this.http.get<ProfessionalModel>(API_PROFESSIONALS_URL + `/${professionalId}`);
	}

	findProfessionals(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);

		const url = API_PROFESSIONALS_URL + '/find';
		return this.http.post<QueryResultsModel>(url, queryParams, {
			headers: httpHeaders
		});
	}

	// UPDATE => PUT: update the professional on the server
	updateProfessional(professional: ProfessionalModel): Observable<any> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_PROFESSIONALS_URL, professional, { headers: httpHeader });
	}

	// UPDATE Status
	updateStatusForProfessional(professionals: ProfessionalModel[], status: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const body = {
			professionalsForUpdate: professionals,
			newStatus: status
		};
		const url = API_PROFESSIONALS_URL + '/update-status/' + status;
		return this.http.put(url, professionals, { headers: httpHeaders });
	}

	// DELETE => delete the professional from the server
	deleteProfessional(professionalId: number): Observable<ProfessionalModel> {
		const url = `${API_PROFESSIONALS_URL}/${professionalId}`;
		return this.http.delete<ProfessionalModel>(url);
	}

	deleteProfessionals(ids: number[] = []): Observable<any> {
		const url = API_PROFESSIONALS_URL + '/delete';
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const body = { professionalIdsForDelete: ids };
		return this.http.put<QueryResultsModel>(url, ids, { headers: httpHeaders });
	}

	getConnectedCustomers(proId: number): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(API_PROFESSIONALS_URL + '/connected-customers/' + proId, { headers: httpHeader });
	}

	getConnectedBookings(proId: number): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(API_PROFESSIONALS_URL + '/connected-bookings/' + proId, { headers: httpHeader });
	}

	getConnectedInvoices(proId: number): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(API_PROFESSIONALS_URL + '/connected-invoices/' + proId, { headers: httpHeader });
	}

	getConnectedLeads(proId: number): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(API_PROFESSIONALS_URL + '/connected-leads/' + proId, { headers: httpHeader });
	}

}
