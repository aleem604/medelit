// Angular
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// RxJS
import { Observable } from 'rxjs';
// CRUD
import { HttpUtilsService, QueryParamsModel, QueryResultsModel } from '../../_base/crud';
// Models
import { ServiceModel } from '..';
import { environment } from '../../../../environments/environment';


const API_LEADS_URL = `${environment.apiEndpoint}/services`;

@Injectable()
export class ServicesService {
	constructor(private http: HttpClient, private httpUtils: HttpUtilsService) { }

	// CREATE =>  POST: add a new service to the server
	createService(service: ServiceModel): Observable<ServiceModel> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<ServiceModel>(API_LEADS_URL, service, { headers: httpHeaders});
	}

	// READ
	getAllServices(): Observable<ServiceModel[]> {
		return this.http.get<ServiceModel[]>(API_LEADS_URL);
	}

	getServiceById(serviceId: number): Observable<ServiceModel> {
		return this.http.get<ServiceModel>(API_LEADS_URL + `/${serviceId}`);
	}

	findServices(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);

		const url = API_LEADS_URL + '/find';
		return this.http.post<QueryResultsModel>(url, queryParams, {
			headers: httpHeaders
		});
	}

	// UPDATE => PUT: update the service on the server
	updateService(service: ServiceModel): Observable<any> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_LEADS_URL, service, { headers: httpHeader });
	}

	// UPDATE Status
	updateStatusForService(services: ServiceModel[], status: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const body = {
			servicesForUpdate: services,
			newStatus: status
		};
		const url = API_LEADS_URL + '/update-status';
		return this.http.put(url, body, { headers: httpHeaders });
	}

	// DELETE => delete the service from the server
	deleteService(serviceId: number): Observable<ServiceModel> {
		const url = `${API_LEADS_URL}/${serviceId}`;
		return this.http.delete<ServiceModel>(url);
	}

	deleteServices(ids: number[] = []): Observable<any> {
		const url = API_LEADS_URL + '/delete-services';
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const body = { serviceIdsForDelete: ids };
		return this.http.put<QueryResultsModel>(url, body, { headers: httpHeaders} );
	}
}
