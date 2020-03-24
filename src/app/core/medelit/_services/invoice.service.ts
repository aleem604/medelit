// Angular
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// RxJS
import { Observable } from 'rxjs';
// CRUD
import { HttpUtilsService, QueryParamsModel, QueryResultsModel } from '../../_base/crud';
// Models
import { InvoiceModel, InvoiceBookings } from '..';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../_models/apireponse.model';


const API_INVOICE_ENTITIES_URL = `${environment.apiEndpoint}/invoices`;

@Injectable()
export class InvoicesService {
    
	constructor(private http: HttpClient, private httpUtils: HttpUtilsService) { }

	//
	addBookingToInvoice(bookingId: number, invoiceId: number): Observable<ApiResponse> {
		const url = `${API_INVOICE_ENTITIES_URL}/add-booking-to-invoice/${bookingId}/${invoiceId}`;
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<ApiResponse>(url, {}, { headers: httpHeaders });
	}

	//
	createInvoiceFromBooking(bookingId: number): Observable<ApiResponse> {
		const url = `${API_INVOICE_ENTITIES_URL}/add-booking-to-invoice/${bookingId}`;
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<ApiResponse>(url, {}, { headers: httpHeaders });
	}


	// CREATE =>  POST: add a new entity to the server
	createInvoice(entity: InvoiceModel): Observable<InvoiceModel> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<InvoiceModel>(API_INVOICE_ENTITIES_URL, entity, { headers: httpHeaders });
	}

	
	// READ
	getAllInvoices(): Observable<InvoiceModel[]> {
		return this.http.get<InvoiceModel[]>(API_INVOICE_ENTITIES_URL);
	}

	getInvoiceById(entityId: number): Observable<InvoiceModel> {
		return this.http.get<InvoiceModel>(API_INVOICE_ENTITIES_URL + `/${entityId}`);
	}

	findInvoices(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);

		const url = API_INVOICE_ENTITIES_URL + '/find';
		return this.http.post<QueryResultsModel>(url, queryParams, {
			headers: httpHeaders
		});
	}

	// UPDATE => PUT: update the entity on the server
	updateInvoice(entity: InvoiceModel): Observable<any> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_INVOICE_ENTITIES_URL, entity, { headers: httpHeader });
	}

	// UPDATE => PUT: update the entity on the server
	processInvoiceEmission(invoiceId: number): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(API_INVOICE_ENTITIES_URL + '/process-invoice-emission/' + invoiceId, { headers: httpHeader });
	}

	// UPDATE Status
	updateStatusForInvoice(entities: InvoiceModel[], status: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const body = {
			entitiesForUpdate: entities,
			newStatus: status
		};
		const url = API_INVOICE_ENTITIES_URL + '/update-status';
		return this.http.put(url, body, { headers: httpHeaders });
	}

	// DELETE => delete the entity from the server
	deleteInvoice(entityId: number): Observable<InvoiceModel> {
		const url = `${API_INVOICE_ENTITIES_URL}/${entityId}`;
		return this.http.delete<InvoiceModel>(url);
	}

	deleteInvoices(ids: number[] = []): Observable<any> {
		const url = API_INVOICE_ENTITIES_URL + '/delete-invoices';
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		//const body = { leadIdsForDelete: ids };
		return this.http.put<QueryResultsModel>(url, ids, { headers: httpHeaders });
	}

	deleteInvoiceBooking(ib: InvoiceBookings): Observable<ApiResponse> {
		const url = API_INVOICE_ENTITIES_URL + '/delete-invoice-booking/'+ ib.id;
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		//const body = { leadIdsForDelete: ids };
		return this.http.delete<ApiResponse>(url, { headers: httpHeaders });
	}

	getInvoiceView(invoiceId: number): Observable<ApiResponse> {
		return this.http.get<ApiResponse>(API_INVOICE_ENTITIES_URL + `/view/${invoiceId}`);
	}

	// bookings that can be attached to invoice
	getBookingsToAddToInvoice(invoiceId: number): Observable<ApiResponse> {
		return this.http.get<ApiResponse>(API_INVOICE_ENTITIES_URL + `/bookings-to-add-to-invoice/${invoiceId}`);
	}

	addBookingsToInvoice(bookingIds: number[], invoiceId: number): Observable<ApiResponse> {
		const url = `${API_INVOICE_ENTITIES_URL}/add-bookings-to-invoice/${invoiceId}`;
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<ApiResponse>(url, bookingIds, { headers: httpHeaders });
	}


	getInvoiceConnectedProfessionals(invoiceId: number): Observable<ApiResponse> {
		return this.http.get<ApiResponse>(API_INVOICE_ENTITIES_URL + `/invoice-connected-professionals/${invoiceId}`);
	}

	getInvoiceConnectedCustomers(invoiceId: number): Observable<ApiResponse> {
		return this.http.get<ApiResponse>(API_INVOICE_ENTITIES_URL + `/invoice-connected-customers/${invoiceId}`);
	}

	getInvoiceConnectedInvoiceEntities(invoiceId: number): Observable<ApiResponse> {
		return this.http.get<ApiResponse>(API_INVOICE_ENTITIES_URL + `/invoice-connected-invoice-entities/${invoiceId}`);
	}

	getInvoiceConnectedBookings(invoiceId: number): Observable<ApiResponse> {
		return this.http.get<ApiResponse>(API_INVOICE_ENTITIES_URL + `/invoice-connected-bookings/${invoiceId}`);
	}

	
	
}
