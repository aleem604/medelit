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
import { ApiResponse } from '../_models/apireponse.model';
import { FeeDialogModel } from '../_models/fee.model';
import { map } from 'rxjs/operators';


const API_SERVICES_URL = `${environment.apiEndpoint}/services`;

@Injectable()
export class ServicesService {
	constructor(private http: HttpClient, private httpUtils: HttpUtilsService) { }

	// CREATE =>  POST: add a new service to the server
	createService(service: ServiceModel): Observable<ServiceModel> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<ServiceModel>(API_SERVICES_URL, service, { headers: httpHeaders });
	}

	// READ
	getAllServices(): Observable<ServiceModel[]> {
		return this.http.get<ServiceModel[]>(API_SERVICES_URL);
	}

	getServiceById(serviceId: number): Observable<ServiceModel> {
		return this.http.get<ServiceModel>(API_SERVICES_URL + `/${serviceId}`);
	}

	getServiceTags(): Observable<string[]> {
		return this.http.get<ApiResponse>(API_SERVICES_URL + `/tags`).pipe(map(m =>m.data as string[]));
	}

	findServices(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);

		const url = API_SERVICES_URL + '/find';
		return this.http.post<QueryResultsModel>(url, queryParams, {
			headers: httpHeaders
		});
	}

	// UPDATE => PUT: update the service on the server
	updateService(service: ServiceModel): Observable<any> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_SERVICES_URL, service, { headers: httpHeader });
	}

	// UPDATE Status
	updateStatusForService(services: ServiceModel[], status: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const body = {
			servicesForUpdate: services,
			newStatus: status
		};
		const url = API_SERVICES_URL + '/update-status/' + status;
		return this.http.put(url, services, { headers: httpHeaders });
	}

	// DELETE => delete the service from the server
	deleteService(serviceId: number): Observable<ServiceModel> {
		const url = `${API_SERVICES_URL}/${serviceId}`;
		return this.http.delete<ServiceModel>(url);
	}

	deleteServices(ids: number[] = []): Observable<any> {
		const url = API_SERVICES_URL + '/delete-services';
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const body = { serviceIdsForDelete: ids };
		return this.http.put<QueryResultsModel>(url, ids, { headers: httpHeaders });
	}

	// attach fee to service on fly or create new fee and attach to service in service table
	addUpdateFeeToService(model: FeeDialogModel): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.post<ApiResponse>(API_SERVICES_URL + '/services-add-update-fees', model, { headers: httpHeader });
	}

	getAttachServiceToProData(proId: number, fieldId?: number, categoryId?: number, tag?: string): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.post<ApiResponse>(API_SERVICES_URL + '/services-data-for-attach', { professionalId: proId, FieldId: fieldId, SubCategoryId: categoryId, Tag: tag }, { headers: httpHeader });
	}

	addProfessionalToServices(entities, proId: number): Observable<ApiResponse> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<ApiResponse>(`${API_SERVICES_URL}/save-professional-services/${proId}`, entities, { headers: httpHeaders });
	}

	detachProfessioal(serviceId: number, proId: number): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(API_SERVICES_URL + '/detach-professional/' + serviceId + '/' + proId, { headers: httpHeader });
	}

	getProfessionalRelations(proId: number): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(API_SERVICES_URL + '/professionals-relations/' + proId, { headers: httpHeader });
	}

	getProfessionalFeesInfo(serviceId: number): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(API_SERVICES_URL + '/professionals-fees-detail/' + serviceId, { headers: httpHeader });
	}

	getServiceProfessionals(serviceId: number): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(API_SERVICES_URL + '/service-connected-professionals/' + serviceId, { headers: httpHeader });
	}

	getConnectedCustomersInvoicingEntities(serviceId: number): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(API_SERVICES_URL + '/connected-customers-invoicing-entities/' + serviceId, { headers: httpHeader });
	}

	getConnectedBookings(serviceId: number): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(API_SERVICES_URL + '/service-connected-bookings/' + serviceId, { headers: httpHeader });
	}

	getConnectedCustomerInvoice(serviceId: number): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(API_SERVICES_URL + '/service-connected-customers-invoices/' + serviceId, { headers: httpHeader });
	}

	getConnectedLeads(serviceId: number): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(API_SERVICES_URL + '/service-connected-leads/' + serviceId, { headers: httpHeader });
	}

	// Attach methods
	getServiceConnectedProfessionals(serviceId: number): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(API_SERVICES_URL + '/service-connected-professionals/' + serviceId, { headers: httpHeader });
	}

	getProfessionalsWithFeesToConnectWithService(serviceId: number): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(API_SERVICES_URL + '/professionals-with-fees-to-connect-with-service/' + serviceId, { headers: httpHeader });
	}

	attachProfessionalsToService(objs: any, serviceId: number): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.post<ApiResponse>(API_SERVICES_URL + '/professionals-to-connect-with-service/' + serviceId, objs, { headers: httpHeader });
	}

	detachProfessionalConnectedServices(objs: number[], serviceId: number): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.post<ApiResponse>(API_SERVICES_URL + '/detach-professionals-from-service/' + serviceId, objs, { headers: httpHeader });
	}


	// service connected pt fees methods

	getServiceConnectedPtFees(serviceId: number): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(API_SERVICES_URL + '/service-connected-pt-fees/' + serviceId, { headers: httpHeader });
	}

	getServiceConnectedPtFeesToAttach(serviceId: number): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(API_SERVICES_URL + '/service-connected-pt-fees-to-attach/' + serviceId, { headers: httpHeader });
	}

	saveServiceConnectedPtFeesToAttach(serviceId: number, rows: number[]): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.post<ApiResponse>(API_SERVICES_URL + '/service-connected-pt-fees-attach/' + serviceId, rows, { headers: httpHeader });
	}
	detachServiceConnectedPtFees(serviceId: number, rows: number[]): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.post<ApiResponse>(API_SERVICES_URL + '/service-connected-pt-fees-detach/' + serviceId, rows, { headers: httpHeader });
	}

	getServiceProfesionalFeesRowDetail(serviceProFeeRowId: number): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(API_SERVICES_URL + '/get-service-professional-fee-row-detail/' + serviceProFeeRowId, { headers: httpHeader });
	}

	getFeesForFilter(serviceProFeeRowId: number) {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(`${API_SERVICES_URL}/get-service-professional-fee-fees-for-filter/${serviceProFeeRowId}`, { headers: httpHeader });
	}

	saveServiceProfessionalFee(data: FeeDialogModel, rowId: number): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.post<ApiResponse>(API_SERVICES_URL + '/save-service-professional-fees/' + rowId, data, { headers: httpHeader });
	}


	// end service connected pro fees methods

	// service connected pro fees methods
	getServiceConnectedProFees(serviceId: number): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(API_SERVICES_URL + '/service-connected-pro-fees/' + serviceId, { headers: httpHeader });
	}

	getServiceConnectedProFeesToAttach(serviceId: number): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(API_SERVICES_URL + '/service-connected-pro-fees-to-attach/' + serviceId, { headers: httpHeader });
	}

	saveServiceConnectedProFeesToAttach(serviceId: number, rows: number[]): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.post<ApiResponse>(API_SERVICES_URL + '/service-connected-pro-fees-attach/' + serviceId, rows, { headers: httpHeader });
	}

	detachServiceConnectedProFees(serviceId: number, rows: number[]): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.post<ApiResponse>(API_SERVICES_URL + '/service-connected-pro-fees-detach/' + serviceId, rows, { headers: httpHeader });
	}

	// end service connected pro fees methods


}
