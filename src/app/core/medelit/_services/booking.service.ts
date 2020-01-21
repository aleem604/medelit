// Angular
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// RxJS
import { Observable } from 'rxjs';
// CRUD
import { HttpUtilsService, QueryParamsModel, QueryResultsModel } from '../../_base/crud';
// Models
import { environment } from '../../../../environments/environment';
import { BookingModel } from '../_models/booking.model';
import { ApiResponse } from '..';


const API_BOOKINGS_URL = `${environment.apiEndpoint}/bookings`;

@Injectable()
export class BookingService {
	constructor(private http: HttpClient, private httpUtils: HttpUtilsService) { }

	// CREATE =>  POST: add a new booking to the server
	createBooking(booking: BookingModel): Observable<BookingModel> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<BookingModel>(API_BOOKINGS_URL, booking, { headers: httpHeaders});
	}

	// READ
	getAllBookings(): Observable<BookingModel[]> {
		return this.http.get<BookingModel[]>(API_BOOKINGS_URL);
	}

	getBookingById(bookingId: number): Observable<BookingModel> {
		return this.http.get<BookingModel>(API_BOOKINGS_URL + `/${bookingId}`);
	}

	findBookings(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);

		const url = API_BOOKINGS_URL + '/find';
		return this.http.post<QueryResultsModel>(url, queryParams, {
			headers: httpHeaders
		});
	}

	// UPDATE => PUT: update the booking on the server
	updateBooking(booking: BookingModel): Observable<any> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_BOOKINGS_URL, booking, { headers: httpHeader });
	}

	// UPDATE Status
	updateStatusForBooking(bookings: BookingModel[], status: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const body = {
			bookingsForUpdate: bookings,
			newStatus: status
		};
		const url = API_BOOKINGS_URL + '/update-status/'+ status;
		return this.http.put(url, bookings, { headers: httpHeaders });
	}

	// DELETE => delete the booking from the server
	deleteBooking(bookingId: number): Observable<BookingModel> {
		const url = `${API_BOOKINGS_URL}/${bookingId}`;
		return this.http.delete<BookingModel>(url);
	}

	deleteBookings(ids: number[] = []): Observable<any> {
		const url = API_BOOKINGS_URL + '/delete';
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const body = { bookingIdsForDelete: ids };
		return this.http.put<QueryResultsModel>(url, ids, { headers: httpHeaders} );
	}

	convertToBooking(bookingId: number): Observable<BookingModel> {
		const url = `${API_BOOKINGS_URL}/convert-booking/${bookingId}`;
		return this.http.get<BookingModel>(url);
	}

	
	createClone(bookingId: number, bookings:number): Observable<ApiResponse> {
		const url = `${API_BOOKINGS_URL}/create-clones/${bookingId}/${bookings}`;
		return this.http.get<ApiResponse>(url);
	}

	createCycle(bookingId: number, cycles: number): Observable<ApiResponse> {
		const url = `${API_BOOKINGS_URL}/create-cycle/${bookingId}/${cycles}`;
		return this.http.get<ApiResponse>(url);
	}

	getBookingConnectedBookings(bookingId: number): Observable<ApiResponse> {
		const url = `${API_BOOKINGS_URL}/booking-cycle-connected-bookings/${bookingId}`;
		return this.http.get<ApiResponse>(url);
	}

	getBookingConnectedProfessionals(bookingId: number): Observable<ApiResponse> {
		const url = `${API_BOOKINGS_URL}/booking-connected-professionals/${bookingId}`;
		return this.http.get<ApiResponse>(url);
	}

	getBookingConnectedInvoices(bookingId: number): Observable<ApiResponse> {
		const url = `${API_BOOKINGS_URL}/booking-connected-invoices/${bookingId}`;
		return this.http.get<ApiResponse>(url);
	}

}
