import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { QueryParamsModel, HttpUtilsService } from '../../_base/crud';
import { ApiResponse, FilterModel } from '..';


const API_STATIC_DATA_URL = environment.apiEndpoint + '/static';
// Real REST API
@Injectable()
export class StaticDataService {

	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'desc', '', 0, 10));

	constructor(private http: HttpClient,
		private httpUtils: HttpUtilsService) { }


	getCustomersForImportFilter(): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/customers', { headers: httpHeader });
	}

	getCustomersForFilter(): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/customers-for-filter');
	}

	getInvoicesForFilter(): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/invoices', { headers: httpHeader });
	}

	getApplicationMethodsForFilter(): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/application-methods', { headers: httpHeader });
	}

	getApplicationMeansForFilter(): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/application-means', { headers: httpHeader });
	}

	getContractStatusOptions(): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/contract-status', { headers: httpHeader });
	}

	getDocumentListSentForFilter(): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/document-list-sent', { headers: httpHeader });
	}

	getCollaborationCodes(): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/collaboration-codes', { headers: httpHeader });
	}

	getStatuses(): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/statuses', { headers: httpHeader });
	}

	getTitlesForFilter(): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/titles', { headers: httpHeader });
	}

	getLanguagesForFilter(): any {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/languages', { headers: httpHeader });
	}

	getCitiesForFilter(): any {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/cities', { headers: httpHeader });
	}

	getCountriesForFilter(): any {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/countries', { headers: httpHeader });
	}

	getRelationshipsForFilter(): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/relationships', { headers: httpHeader });
	}

	getAccountingCodesForFilter(): any {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/accounting-codes', { headers: httpHeader });
	}

	getFieldsForFilter(): any {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/fields', { headers: httpHeader });
	}

	getCategoriesForFilter(fields: FilterModel[]): any {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.post<ApiResponse>(API_STATIC_DATA_URL + '/categories', fields, { headers: httpHeader });
	}

	getDurationsForFilter(): any {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/durations', { headers: httpHeader });
	}

	getVatsForFilter(): any {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/vats', { headers: httpHeader });
	}

	getPTFeesForFilter(): any {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/ptfees', { headers: httpHeader });
	}

	getPROFeesForFilter(): any {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/profees', { headers: httpHeader });
	}

	getProfessionalsForFilter(serviceId?: number): any {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		if (serviceId)
			return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/professionas-with-fees/' + serviceId, { headers: httpHeader });
		else
			return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/professionas-with-fees', { headers: httpHeader });
	}

	getServicesForFilter(): any {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/services', { headers: httpHeader });
	}

	getPaymentMethodsForFilter(): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/payment-methods', { headers: httpHeader });
	}

	getPaymentStatusForFilter(): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/payment-status', { headers: httpHeader });
	}

	getDiscountNetworksForFilter(): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/discount-networks', { headers: httpHeader });
	}

	getInvoiceEntitiesForFilter(): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/invoice-entities', { headers: httpHeader });
	}

	getVisitVenuesForFilter(): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/visit-venues', { headers: httpHeader });
	}

	getBuildingTypesForFilter(): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/building-types', { headers: httpHeader });
	}

	getLeadStatusesForFilter(): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/lead-statuses', { headers: httpHeader });
	}

	getLeadSourcesForFilter(): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/lead-sources', { headers: httpHeader });
	}

	getLeadCategoriesForFilter(): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/lead-categories', { headers: httpHeader });
	}

	getContactMethodsForFilter(): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/contact-methods', { headers: httpHeader });
	}

	getBookingStatusesForFilter(): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/booking-status', { headers: httpHeader });
	}

	getReportDeliveryOptions(): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/report-delivery-options', { headers: httpHeader });
	}

	getAddedToAccountOptions(): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/added-to-account-options', { headers: httpHeader });
	}

	getRatingOptions(): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/ratings', { headers: httpHeader });
	}

	getInvoiceEntityTypesForFilter(): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/ie-types', { headers: httpHeader });
	}

	getInvoiceStatusOptions(): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/invoice-status', { headers: httpHeader });
	}

	getStaticDataForFitler(): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/static-data', { headers: httpHeader });
	}

	getLabsForFilter(): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(API_STATIC_DATA_URL + '/labs', { headers: httpHeader });
	}

}
