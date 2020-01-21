import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { User } from '../_models/user.model';
import { Role } from '../_models/role.model';
import { catchError, map } from 'rxjs/operators';
import { QueryParamsModel, QueryResultsModel } from '../../_base/crud';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../medelit';

const API_USERS_URL = `${environment.apiEndpoint}/account`;
const API_ROLES_URL = `${environment.apiEndpoint}/roles`;

@Injectable()
export class AuthService {
	constructor(private http: HttpClient) { }
	// Authentication/Authorization
	login(email: string, password: string): Observable<User> {
		return this.http.post<User>(API_USERS_URL + '/login', { email, password });
	}

	getUserByToken(): Observable<User> {
		const userToken = this.LocalStorageItem;
		let httpHeaders = new HttpHeaders();
		httpHeaders.set('Authorization', 'Bearer ' + userToken);
		return this.http.get<User>(API_USERS_URL + '/current-user', { headers: new HttpHeaders().set("Authorization", "Bearer " + userToken) });
	}

	get LocalStorageItem() {
		let token = null;
		for (var i = 0; i < 1000; i++) {
			token = localStorage.getItem(environment.authTokenKey);
			if (!token)
				continue;
			else
				break;
		}
		return token;
	}

	register(user: User): Observable<any> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<User>(API_USERS_URL, user, { headers: httpHeaders })
			.pipe(
				map((res: User) => {
					return res;
				}),
				catchError(err => {
					return null;
				})
			);
	}

	public requestPassword(email: string): Observable<any> {
		return this.http.get(API_USERS_URL + '/forgot?=' + email)
			.pipe(catchError(this.handleError('forgot-password', []))
			);
	}


	getAllUsers(): Observable<User[]> {
		return this.http.get<User[]>(API_USERS_URL + '/users');
	}

	getUserById(userId: string): Observable<User> {
		return this.http.get<User>(API_USERS_URL + `/users/${userId}`);
	}


	// DELETE => delete the user from the server
	deleteUser(userId: string) {
		const url = `${API_USERS_URL}/${userId}`;
		return this.http.delete(url);
	}

	// UPDATE => PUT: update the user on the server
	updateUser(_user: User): Observable<any> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.put(API_USERS_URL + '/users', _user, { headers: httpHeaders });
	}

	// CREATE =>  POST: add a new user to the server
	createUser(user: User): Observable<User> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<User>(API_USERS_URL + '/users', user, { headers: httpHeaders });
	}

	// Method from server should return QueryResultsModel(items: any[], totalsCount: number)
	// items => filtered/sorted result
	findUsers(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<QueryResultsModel>(API_USERS_URL + '/users/find', queryParams, { headers: httpHeaders });
	}

	isEmailRegisterd(email: string, userId: string): Observable<ApiResponse> {
		return this.http.get<ApiResponse>(API_USERS_URL + '/email-taken/' + email + '/' + userId);
	}

	// Roles
	getAllRoles(): Observable<Role[]> {
		return this.http.get<Role[]>(API_ROLES_URL);
	}

	getRoleById(roleId: string): Observable<Role> {
		return this.http.get<Role>(API_ROLES_URL + `/${roleId}`);
	}

	// CREATE =>  POST: add a new role to the server
	createRole(role: Role): Observable<Role> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<Role>(API_ROLES_URL, role, { headers: httpHeaders });
	}

	// UPDATE => PUT: update the role on the server
	updateRole(role: Role): Observable<any> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.put(API_ROLES_URL, role, { headers: httpHeaders });
	}

	// DELETE => delete the role from the server
	deleteRole(roleId: string): Observable<Role> {
		const url = `${API_ROLES_URL}/${roleId}`;
		return this.http.delete<Role>(url);
	}

	// Check Role Before deletion
	isRoleAssignedToUsers(roleId: string): Observable<boolean> {
		return this.http.get<boolean>(API_ROLES_URL + '/checkIsRollAssignedToUser?roleId=' + roleId);
	}

	findRoles(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
		// This code imitates server calls
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<QueryResultsModel>(API_ROLES_URL + '/find', queryParams, { headers: httpHeaders });
	}

	private handleError<T>(operation = 'operation', result?: any) {
		return (error: any): Observable<any> => {
			// TODO: send the error to remote logging infrastructure
			console.error(error); // log to console instead

			// Let the app keep running by returning an empty result.
			return of(result);
		};
	}
}
