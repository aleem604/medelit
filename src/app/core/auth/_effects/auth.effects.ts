// Angular
import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
// RxJS
import { filter, mergeMap, tap, withLatestFrom, map, catchError } from 'rxjs/operators';
import { defer, Observable, of, pipe } from 'rxjs';
// NGRX
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action, select, Store } from '@ngrx/store';
// Auth actions
import { AuthActionTypes, Login, Logout, Register, UserLoaded, UserRequested } from '../_actions/auth.actions';
import { AuthService } from '../_services/index';
import { AppState } from '../../reducers';
import { environment } from '../../../../environments/environment';
import { isUserLoaded } from '../_selectors/auth.selectors';
import { ApiResponse } from '../../medelit';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable()
export class AuthEffects {
	@Effect({ dispatch: false })
	login$ = this.actions$.pipe(
		ofType<Login>(AuthActionTypes.Login),
		tap(action => {
			localStorage.setItem(environment.authTokenKey, action.payload.authToken);
			this.store.dispatch(new UserRequested());
		}),
	);

	@Effect({ dispatch: false })
	logout$ = this.actions$.pipe(
		ofType<Logout>(AuthActionTypes.Logout),
		tap(() => {
			localStorage.removeItem(environment.authTokenKey);
			this.router.navigate(['/auth/login'], { queryParams: { returnUrl: this.returnUrl } });
		})
	);

	@Effect({ dispatch: false })
	register$ = this.actions$.pipe(
		ofType<Register>(AuthActionTypes.Register),
		tap(action => {
			localStorage.setItem(environment.authTokenKey, action.payload.authToken);
		})
	);

	@Effect({ dispatch: false })
	loadUser$ = this.actions$
		.pipe(
			ofType<UserRequested>(AuthActionTypes.UserRequested),
			withLatestFrom(this.store.pipe(select(isUserLoaded))),
			filter(([action, _isUserLoaded]) => !_isUserLoaded),
			mergeMap(([action, _isUserLoaded]) => this.auth.getUserByToken()),
			pipe(catchError((err: HttpErrorResponse) => {
				if (err.status === 401) {
					this.store.dispatch(new Logout());
				}
				return of(null);
			})),
			tap(_user => {
				if (_user) {
					var user = _user as unknown as ApiResponse;
					this.store.dispatch(new UserLoaded({ user: user.data }));
				} else {
					this.store.dispatch(new Logout());
				}
			})
		);

	@Effect()
	init$: Observable<Action> = defer(() => {
		const userToken = localStorage.getItem(environment.authTokenKey);
		let observableResult = of({ type: 'NO_ACTION' });
		if (userToken) {
			observableResult = of(new Login({ authToken: userToken }));
		}
		return observableResult;
	});

	private returnUrl: string;

	constructor(private actions$: Actions,
		private router: Router,
		private auth: AuthService,
		private store: Store<AppState>) {
		console.log(this.returnUrl);
		this.router.events.subscribe(event => {
			if (event instanceof NavigationEnd) {
				var parts = event.url.split('returnUrl');


				if (event.url.indexOf('auth') > -1) {
					this.returnUrl = this.returnUrl;
				} else if (parts.length > 3) {
					this.returnUrl = parts[0] + 'returnUrl' + parts[1];
				} else {
					if (!this.returnUrl)
						this.returnUrl = event.url;
				}
			}
		});
	}
}
