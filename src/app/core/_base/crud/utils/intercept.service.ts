import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { AppState } from '../../../reducers';
import { Store } from '@ngrx/store';
import { Logout } from '../../../auth/_actions/auth.actions';


@Injectable()
export class InterceptService implements HttpInterceptor {

	constructor(private store: Store<AppState>) {
	}

	// intercept request and add token
	intercept(
		request: HttpRequest<any>,
		next: HttpHandler
	): Observable<HttpEvent<any>> {
		// tslint:disable-next-line:no-debugger
		// modify request
		
		const userToken = localStorage.getItem(environment.authTokenKey);
		 request = request.clone({
		 	setHeaders: {
				 Authorization: `Bearer ${userToken}`
		 	}
		 });
		 //console.log('----request----');
		 //console.log(request);
		 //console.log('--- end of request---');

		return next.handle(request).pipe(
			tap(
				event => {
					 if (event instanceof HttpResponse) {
						// console.log('all looks good');
						// http response status code
						 //console.log('status:   ',event.status);
					}
				},
				error => {
					if (error.status == '401') {
						this.store.dispatch(new Logout());
					}

					// http response status code
					// console.log('----response----');
					// console.error('status code:');
					// tslint:disable-next-line:no-debugger
					//console.error('error status:   ', error.status);
					//console.error('error message:     ',error.message);
					// console.log('--- end of response---');
				}
			)
		);
	}
}
