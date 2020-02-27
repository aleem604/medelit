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


	getCustomersForImportFilter(): Observable<ApiResponse> {
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/customers');
	}

	getCustomersForFilter(): Observable<ApiResponse> {
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/customers-for-filter');
	}

	getInvoicesForFilter(): Observable<ApiResponse> {
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/invoices');
	}

	getApplicationMethodsForFilter(): Observable<ApiResponse> {
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/application-methods');
	}

	getApplicationMeansForFilter(): Observable<ApiResponse> {
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/application-means');
	}

	getContractStatusOptions(): Observable<ApiResponse> {
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/contract-status');
	}

	getDocumentListSentForFilter(): Observable<ApiResponse> {
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/document-list-sent');
	}

	getCollaborationCodes(): Observable<ApiResponse> {
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/collaboration-codes');
	}

	getStatuses(): Observable<ApiResponse> {
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/statuses');
	}

	getTitlesForFilter(): Observable<ApiResponse> {
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/titles');
	}

	getLanguagesForFilter(): any {
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/languages');
	}

	getCitiesForFilter(): any {
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/cities');
	}

	getCountriesForFilter(): any {
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/countries');
	}

	getRelationshipsForFilter(): Observable<ApiResponse> {
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/relationships');
	}

	getAccountingCodesForFilter(): any {
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/accounting-codes');
	}

	getFieldsForFilter(): any {
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/fields');
	}

	getCategoriesForFilter(): any {
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/categories');
	}

	getDurationsForFilter(): any {
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/durations');
	}

	getVatsForFilter(): any {
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/vats');
	}

	getPTFeesForFilter(): any {
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/ptfees');
	}

	getPROFeesForFilter(): any {
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/profees');
	}

	getProfessionalsForFilter(serviceId?: number): any {
		if (serviceId)
			return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/professionas-with-fees/' + serviceId);
		else
			return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/professionas-with-fees');
	}

	getServicesForFilter(): any {
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/services');
	}

	getPaymentMethodsForFilter(): Observable<ApiResponse> {
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/payment-methods');
	}

	getPaymentStatusForFilter(): Observable<ApiResponse> {
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/payment-status');
	}

	getDiscountNetworksForFilter(): Observable<ApiResponse> {
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/discount-networks');
	}

	getInvoiceEntitiesForFilter(): Observable<ApiResponse> {
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/invoice-entities');
	}

	getVisitVenuesForFilter(): Observable<ApiResponse> {
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/visit-venues');
	}

	getBuildingTypesForFilter(): Observable<ApiResponse> {
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/building-types');
	}

	getLeadStatusesForFilter(): Observable<ApiResponse> {
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/lead-statuses');
	}

	getLeadSourcesForFilter(): Observable<ApiResponse> {
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/lead-sources');
	}

	getLeadCategoriesForFilter(): Observable<ApiResponse> {
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/lead-categories');
	}

	getContactMethodsForFilter(): Observable<ApiResponse> {
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/contact-methods');
	}

	getBookingStatusesForFilter(): Observable<ApiResponse> {
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/booking-status');
	}

	getReportDeliveryOptions(): Observable<ApiResponse> {
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/report-delivery-options');
	}

	getAddedToAccountOptions(): Observable<ApiResponse> {
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/added-to-account-options');
	}

	getRatingOptions(): Observable<ApiResponse> {
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/ratings');
	}

	getInvoiceEntityTypesForFilter(): Observable<ApiResponse> {
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/ie-types');
	}

	getInvoiceStatusOptions(): Observable<ApiResponse> {
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/invoice-status');
	}

	getStaticDataForFitler(): Observable<ApiResponse> {
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/static-data');
	}

	getLabsForFilter(): Observable<ApiResponse> {
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/labs');
	}

}
