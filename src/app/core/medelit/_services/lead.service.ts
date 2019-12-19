// Angular
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// RxJS
import { Observable } from 'rxjs';
// CRUD
import { HttpUtilsService, QueryParamsModel, QueryResultsModel } from '../../_base/crud';
// Models
import { LeadModel } from '..';
import { environment } from '../../../../environments/environment';


const API_LEADS_URL = `${environment.apiEndpoint}/leads`;

@Injectable()
export class LeadsService {
	constructor(private http: HttpClient, private httpUtils: HttpUtilsService) { }

	// CREATE =>  POST: add a new lead to the server
	createLead(lead: LeadModel): Observable<LeadModel> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<LeadModel>(API_LEADS_URL, lead, { headers: httpHeaders});
	}

	// READ
	getAllLeads(): Observable<LeadModel[]> {
		return this.http.get<LeadModel[]>(API_LEADS_URL);
	}

	getLeadById(leadId: number, fromCustomer?:number): Observable<LeadModel> {
		return this.http.get<LeadModel>(API_LEADS_URL + `/${leadId}/${fromCustomer}`);
	}

	findLeads(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);

		const url = API_LEADS_URL + '/find';
		return this.http.post<QueryResultsModel>(url, queryParams, {
			headers: httpHeaders
		});
	}

	// UPDATE => PUT: update the lead on the server
	updateLead(lead: LeadModel): Observable<any> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_LEADS_URL, lead, { headers: httpHeader });
	}

	// UPDATE Status
	updateStatusForLead(leads: LeadModel[], status: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const body = {
			leadsForUpdate: leads,
			newStatus: status
		};
		const url = API_LEADS_URL + '/update-status/'+ status;
		return this.http.put(url, leads, { headers: httpHeaders });
	}

	// DELETE => delete the lead from the server
	deleteLead(leadId: number): Observable<LeadModel> {
		const url = `${API_LEADS_URL}/${leadId}`;
		return this.http.delete<LeadModel>(url);
	}

	deleteLeads(ids: number[] = []): Observable<any> {
		const url = API_LEADS_URL + '/delete';
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const body = { leadIdsForDelete: ids };
		return this.http.put<QueryResultsModel>(url, ids, { headers: httpHeaders} );
	}

	convertToBooking(leadId: number): Observable<LeadModel> {
		const url = `${API_LEADS_URL}/convert-booking/${leadId}`;
		return this.http.get<LeadModel>(url);
	}


}
