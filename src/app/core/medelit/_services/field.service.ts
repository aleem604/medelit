// Angular
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// RxJS
import { Observable } from 'rxjs';
// CRUD
import { HttpUtilsService, QueryParamsModel, QueryResultsModel } from '../../_base/crud';
// Models
import { FieldModel } from '..';
import { environment } from '../../../../environments/environment';


const API_LEADS_URL = `${environment.apiEndpoint}/fields`;

@Injectable()
export class FieldsService {
	constructor(private http: HttpClient, private httpUtils: HttpUtilsService) { }

	// CREATE =>  POST: add a new field to the server
	createField(field: FieldModel): Observable<FieldModel> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<FieldModel>(API_LEADS_URL, field, { headers: httpHeaders});
	}

	// READ
	getAllFields(): Observable<FieldModel[]> {
		return this.http.get<FieldModel[]>(API_LEADS_URL);
	}

	getFieldById(fieldId: number): Observable<FieldModel> {
		return this.http.get<FieldModel>(API_LEADS_URL + `/${fieldId}`);
	}

	findFields(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);

		const url = API_LEADS_URL + '/find';
		return this.http.post<QueryResultsModel>(url, queryParams, {
			headers: httpHeaders
		});
	}

	// UPDATE => PUT: update the field on the server
	updateField(field: FieldModel): Observable<any> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_LEADS_URL, field, { headers: httpHeader });
	}

	// UPDATE Status
	updateStatusForField(fields: FieldModel[], status: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const body = {
			fieldsForUpdate: fields,
			newStatus: status
		};
		const url = API_LEADS_URL + '/update-status';
		return this.http.put(url, body, { headers: httpHeaders });
	}

	// DELETE => delete the field from the server
	deleteField(fieldId: number): Observable<FieldModel> {
		const url = `${API_LEADS_URL}/${fieldId}`;
		return this.http.delete<FieldModel>(url);
	}

	deleteFields(ids: number[] = []): Observable<any> {
		const url = API_LEADS_URL + '/delete-fields';
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const body = { fieldIdsForDelete: ids };
		return this.http.put<QueryResultsModel>(url, body, { headers: httpHeaders} );
	}
}
