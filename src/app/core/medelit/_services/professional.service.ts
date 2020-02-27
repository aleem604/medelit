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
import { FeeDialogModel, ProfessionalConnectedServicesModel } from '../_models/fee.model';


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

	getProfessionalConnectedServices(proId: number): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(API_PROFESSIONALS_URL + '/professional-connected-services/' + proId, { headers: httpHeader });
	}

	detachProfessionalConnectedServices(serviceIds: Array<ProfessionalConnectedServicesModel>, proId: number): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.post<ApiResponse>(API_PROFESSIONALS_URL + '/detach-professional-connected-service/' + proId, serviceIds, { headers: httpHeader });
	}

	// start add fee to service methods
	getProfessionalServiceDetail(ptServiceProfessionalRowId: number, proServiceProfessionalRowId: number): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(`${API_PROFESSIONALS_URL}/professional-service-detail/${ptServiceProfessionalRowId}/${proServiceProfessionalRowId}`, { headers: httpHeader });
	}


	saveProfessionalServiceFee(feeDiagModel: FeeDialogModel, serviceId:number, proId: number): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.post<ApiResponse>(`${API_PROFESSIONALS_URL}/professional-service-detail/${serviceId}/${proId}`, feeDiagModel, { headers: httpHeader });
	}

	getServicesToConnectWithProfessional(proId: number): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(`${API_PROFESSIONALS_URL}/services-data-for-attach/${proId}`, { headers: httpHeader });
	}

	getServicesForConnectFilter(proId: number): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(`${API_PROFESSIONALS_URL}/services-for-connect-filter/${proId}`, { headers: httpHeader });
	}

	attachProfessionalToService(serviceIds:number[], proId: any): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.post<ApiResponse>(`${API_PROFESSIONALS_URL}/attach-services-to-professional/${proId}`,serviceIds, { headers: httpHeader });
	}
	                                                                           
	getFeesForFilter(serviceId:number, proId: number): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(`${API_PROFESSIONALS_URL}/fees-for-filter-to-attach-with-service-professional/${serviceId}/${proId}`, { headers: httpHeader });
	}

}
