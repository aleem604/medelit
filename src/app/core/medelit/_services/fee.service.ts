// Angular
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// RxJS
import { Observable } from 'rxjs';
// CRUD
import { HttpUtilsService, QueryParamsModel, QueryResultsModel } from '../../_base/crud';
// Models
import { FeeModel } from '..';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../_models/apireponse.model';


const API_FEES_URL = `${environment.apiEndpoint}/fees`;

@Injectable()
export class FeesService {
	constructor(private http: HttpClient, private httpUtils: HttpUtilsService) { }

	// CREATE =>  POST: add a new fee to the server
	createFee(fee: FeeModel): Observable<FeeModel> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<FeeModel>(API_FEES_URL, fee, { headers: httpHeaders});
	}

	// READ
	getAllFees(): Observable<FeeModel[]> {
		return this.http.get<FeeModel[]>(API_FEES_URL);
	}

	getFeeById(feeId: number): Observable<FeeModel> {
		return this.http.get<FeeModel>(API_FEES_URL + `/${feeId}`);
	}

	findFees(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);

		const url = API_FEES_URL + '/find';
		return this.http.post<QueryResultsModel>(url, queryParams, {
			headers: httpHeaders
		});
	}

	// UPDATE => PUT: update the fee on the server
	updateFee(fee: FeeModel): Observable<any> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_FEES_URL, fee, { headers: httpHeader });
	}

	

	// UPDATE Status
	updateStatusForFee(fees: FeeModel[], status: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const body = {
			feesForUpdate: fees,
			newStatus: status
		};
		const url = API_FEES_URL + '/update-status/'+status;
		return this.http.put(url, fees, { headers: httpHeaders });
	}

	// DELETE => delete the fee from the server
	deleteFee(feeId: number): Observable<FeeModel> {
		const url = `${API_FEES_URL}/${feeId}`;
		return this.http.delete<FeeModel>(url);
	}

	deleteFees(ids: number[] = []): Observable<any> {
		const url = API_FEES_URL + '/delete';
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const body = { feeIdsForDelete: ids };
		return this.http.put<QueryResultsModel>(url, ids, { headers: httpHeaders} );
	}

	getConnectProfessionalsCustomers(feeId: number): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(API_FEES_URL + '/connected-professionals-customers/' + feeId, { headers: httpHeader });
	}

	getFeeConnectedServices(feeId: number): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(API_FEES_URL + '/connected-services/' + feeId, { headers: httpHeader });
	}

	getServicesToConnectWithFee(feeId: number): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(API_FEES_URL + '/services-to-connect-with-fee/' + feeId, { headers: httpHeader });
	}

	saveServicesToConnectWithFee(serviceIds: any[], feeId: number): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.post<ApiResponse>(API_FEES_URL + '/services-to-connect-with-fee/' + feeId, serviceIds, { headers: httpHeader });
	}

}
