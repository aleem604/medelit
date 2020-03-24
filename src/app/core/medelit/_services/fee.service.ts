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
import { eFeeType } from '../_enums/e-fee-type.enum';
import { ServiceModel } from '../_models/service.model';
import { FeeConnectedProfessionalsModel } from '../_models/fee.model';


const API_FEES_URL = `${environment.apiEndpoint}/fees`;

@Injectable()
export class FeesService {
	constructor(private http: HttpClient, private httpUtils: HttpUtilsService) { }

	// CREATE =>  POST: add a new fee to the server
	createFee(fee: FeeModel): Observable<FeeModel> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<FeeModel>(API_FEES_URL, fee, { headers: httpHeaders });
	}

	// READ
	getAllFees(): Observable<FeeModel[]> {
		return this.http.get<FeeModel[]>(API_FEES_URL);
	}

	getFeeById(feeId: number, typeId?:number): Observable<FeeModel> {
		return this.http.get<FeeModel>(API_FEES_URL + `/${feeId}/${typeId}`);
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
		const url = API_FEES_URL + '/update-status/' + status;
		return this.http.put(url, fees, { headers: httpHeaders });
	}

	// DELETE => delete the fee from the server
	deleteFee(feeId: number, feeTypeId: number): Observable<FeeModel> {
		const url = `${API_FEES_URL}/${feeId}/${feeTypeId}`;
		return this.http.delete<FeeModel>(url);
	}

	deleteFees(ids: FeeModel[] = []): Observable<any> {
		const url = API_FEES_URL + '/delete';
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const body = { feeIdsForDelete: ids };
		return this.http.put<QueryResultsModel>(url, ids, { headers: httpHeaders });
	}

	getFeeConnectedServices(feeId: number, feeType: number): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(`${API_FEES_URL}/fee-connected-services/${feeId}/${feeType}`, { headers: httpHeader });
	}

	connectFeesToProfessionalAndService(serviceId: number, professionalId:number, fees: Array<FeeModel>): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.post<ApiResponse>(`${API_FEES_URL}/connect-fees-to-service-and-professional/${serviceId}/${professionalId}`, fees, { headers: httpHeader });
	}

	getServicesToConnectWithFee(feeId: number, feeType: eFeeType): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(`${API_FEES_URL}/services-to-connect-with-fee/${feeId}/${feeType}`, { headers: httpHeader });
	}

	saveServicesToConnectWithFee(serviceIds: any[], feeId: number, feeType: eFeeType): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.post<ApiResponse>(`${API_FEES_URL}/services-to-connect-with-fee/${feeId}/${feeType}`, serviceIds, { headers: httpHeader });
	}

	deleteConnectedServices(feeIds: number[], feeId: number, feeType: eFeeType): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.post<ApiResponse>(`${API_FEES_URL}/delete-connected-services/${feeId}/${feeType}`, feeIds, { headers: httpHeader });
	}

	/// fee connected professionals
	getServicesForFeeForFilter(feeId: number, feeType:number): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(`${API_FEES_URL}/services-for-filter/${feeId}/${feeType}`, { headers: httpHeader });
	}

	getProfessionalForFeeForFilter(serviceId: number, feeId: number, feeType:number): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(`${API_FEES_URL}/professionals-for-filter/${serviceId}/${feeId}/${feeType}`, { headers: httpHeader });
	}

	attachNewServiceProfessionalToFee(serviceId: number, professionalId:number, feeId: number, feeType:number): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(`${API_FEES_URL}/attach-new-service-professional-to-fee/${serviceId}/${professionalId}/${feeId}/${feeType}`, { headers: httpHeader });
	}




	getConnectedProfessionals(feeId: number): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(API_FEES_URL + '/connected-professionals/' + feeId, { headers: httpHeader });
	}

	deleteConnectedProfessionals(feeIds: FeeConnectedProfessionalsModel[], feeId: number, feeType: number): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.post<ApiResponse>(`${API_FEES_URL}/delete-connected-professionals/${feeId}/${feeType}`, feeIds, { headers: httpHeader });
	}

	getFeeConnectedProfessionals(feeId: number, feeType:number): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(`${API_FEES_URL}/fee-connected-professionals/${feeId}/${feeType}`, { headers: httpHeader });
	}

	getProfessionalToConnectWithFee(feeId: number, feeType: number): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.get<ApiResponse>(`${API_FEES_URL}/professional-to-connect-with-fee/${feeId}/${feeType}`, { headers: httpHeader });
	}
	

	saveProfessionalToConnectWithFee(proIds: any[], feeId: number, feeType:number): Observable<ApiResponse> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.post<ApiResponse>(`${API_FEES_URL}/professional-to-connect-with-fee/${feeId}/${feeType}`, proIds, { headers: httpHeader });
	}
	// fee connected professionals

}
