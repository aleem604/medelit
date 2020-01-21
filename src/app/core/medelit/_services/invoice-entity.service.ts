// Angular
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// RxJS
import { Observable } from 'rxjs';
// CRUD
import { HttpUtilsService, QueryParamsModel, QueryResultsModel } from '../../_base/crud';
// Models
import { InvoiceEntityModel, ApiResponse } from '..';
import { environment } from '../../../../environments/environment';


const API_INVOICE_ENTITIES_URL = `${environment.apiEndpoint}/invoice-entities`;

@Injectable()
export class InvoiceEntitiesService {
	constructor(private http: HttpClient, private httpUtils: HttpUtilsService) { }

	// CREATE =>  POST: add a new entity to the server
	createInvoiceEntity(entity: InvoiceEntityModel): Observable<InvoiceEntityModel> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<InvoiceEntityModel>(API_INVOICE_ENTITIES_URL, entity, { headers: httpHeaders});
	}

	// READ
	getAllInvoiceEntities(): Observable<InvoiceEntityModel[]> {
		return this.http.get<InvoiceEntityModel[]>(API_INVOICE_ENTITIES_URL);
	}

	getInvoiceEntityById(entityId: number): Observable<InvoiceEntityModel> {
		return this.http.get<InvoiceEntityModel>(API_INVOICE_ENTITIES_URL + `/${entityId}`);
	}

	findInvoiceEntities(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);

		const url = API_INVOICE_ENTITIES_URL + '/find';
		return this.http.post<QueryResultsModel>(url, queryParams, {
			headers: httpHeaders
		});
	}

	// UPDATE => PUT: update the entity on the server
	updateInvoiceEntity(entity: InvoiceEntityModel): Observable<any> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_INVOICE_ENTITIES_URL, entity, { headers: httpHeader });
	}

	// UPDATE Status
	updateStatusForInvoiceEntity(entities: InvoiceEntityModel[], status: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const body = {
			entitiesForUpdate: entities,
			newStatus: status
		};
		const url = API_INVOICE_ENTITIES_URL + '/update-status';
		return this.http.put(url, body, { headers: httpHeaders });
	}

	// DELETE => delete the entity from the server
	deleteInvoiceEntity(entityId: number): Observable<InvoiceEntityModel> {
		const url = `${API_INVOICE_ENTITIES_URL}/${entityId}`;
		return this.http.delete<InvoiceEntityModel>(url);
	}

	deleteInvoiceEntities(ids: number[] = []): Observable<any> {
		const url = API_INVOICE_ENTITIES_URL + '/delete-entities';
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		//const body = { leadIdsForDelete: ids };
		return this.http.put<QueryResultsModel>(url, ids, { headers: httpHeaders} );
	}

	getInvoiceEntityConnectedServices(ieId: number): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(API_INVOICE_ENTITIES_URL + '/invoice-entity-connected-services/' + ieId, { headers: httpHeader });
	}

	getInvoiceEntityConnectedCustomers(ieId: number): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(API_INVOICE_ENTITIES_URL + '/invoice-entity-connected-customers/' + ieId, { headers: httpHeader });
	}

	getInvoiceEntityConnectedProfessionals(ieId: number): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(API_INVOICE_ENTITIES_URL + '/invoice-entity-connected-professionals/' + ieId, { headers: httpHeader });
	}

	getInvoiceEntityConnectedBookings(ieId: number): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(API_INVOICE_ENTITIES_URL + '/invoice-entity-connected-bookings/' + ieId, { headers: httpHeader });
	}

	getInvoiceEntityConnectedInvoices(ieId: number): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(API_INVOICE_ENTITIES_URL + '/invoice-entity-connected-invoices/' + ieId, { headers: httpHeader });
	}

	getInvoiceEntityConnectedLeads(ieId: number): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(API_INVOICE_ENTITIES_URL + '/invoice-entity-connected-leads/' + ieId, { headers: httpHeader });
	}

}
