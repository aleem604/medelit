import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { of } from 'rxjs/internal/observable/of';

export interface CanComponentDeactivate {
	canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;
}

@Injectable()
export class CanDeactivateGuard implements CanDeactivate<CanComponentDeactivate> {
	canDeactivate(component: CanComponentDeactivate,
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot) {

		let url: string = state.url;
		console.log('Url: ' + url);

		return component.canDeactivate ? component.canDeactivate() : true;
	}
}


@Injectable()
export class DialogService {
	confirm(message?: string): Observable<boolean> {
		const confirmation = window.confirm(message || 'Are you sure?');

		return of(confirmation);
	};
} 
