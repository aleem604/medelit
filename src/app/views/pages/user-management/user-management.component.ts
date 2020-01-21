// Angular
import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
// RxJS
import { Observable } from 'rxjs';
// NGRX
import { Store, select } from '@ngrx/store';
// AppState
import { AppState } from '../../../core/reducers';

@Component({
	selector: 'kt-user-management',
	templateUrl: './user-management.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserManagementComponent implements OnInit {
	// Public properties
	// hasUserAccess$: Observable<boolean>;
	currentUserRoles$: Observable<string[]>;

	constructor(private store: Store<AppState>, private router: Router) {
	}


	ngOnInit() {
		// this.currentUserPermission$ = this.store.pipe(select(currentUserPermissions));
		// this.currentUserPermission$.subscribe(permissions => {
		// 	if (permissions && permissions.length > 0) {
		// 		this.hasUserAccess$ =
		// 			this.store.pipe(select(checkHasUserPermission(userManagementPermissionId)));
		// 		this.hasUserAccess$.subscribe(res => {
		// 			if (!res) {
		// 				this.router.navigateByUrl('/error/403');
		// 			}
		// 		});
		// 	}
		// });
	}
}
