// Angular
import { Component, OnInit, Input } from '@angular/core';
// RxJS
import { BehaviorSubject, Observable } from 'rxjs';
// NGRX
import { Store, select } from '@ngrx/store';
// Lodash
import { each, find, remove } from 'lodash';
// State
import { AppState } from '../../../../../../core/reducers';
// Auth
import { Role, selectAllRoles, AllRolesRequested, AuthService } from '../../../../../../core/auth';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiResponse } from '../../../../../../core/medelit';
import { map } from 'rxjs/operators';

@Component({
	selector: 'kt-user-roles-list',
	templateUrl: './user-roles-list.component.html'
})
export class UserRolesListComponent implements OnInit {
	@Input() loadingSubject = new BehaviorSubject<boolean>(false);
	@Input() rolesSubject: BehaviorSubject<string[]>;

	allUserRoles$: Observable<Role[]>;
	allRoles: Role[] = [];
	unassignedRoles: Role[] = [];
	assignedRoles: Role[] = [];
	roleIdForAdding: string;

	constructor(private store: Store<AppState>,
		private authService: AuthService,
		private spinner: NgxSpinnerService) {

	}

	ngOnInit() {
		this.spinner.show();
		//this.allUserRoles$ = this.store.pipe(select(selectAllRoles));
		this.allUserRoles$ = this.authService.getAllRoles().pipe(
			map(r=> (r as unknown as ApiResponse).data)
		);

		this.allUserRoles$.subscribe((res: Role[]) => {
			this.spinner.hide();
			each(res, (_role: Role) => {
				this.allRoles.push(_role);
				this.unassignedRoles.push(_role);
			});

			each(this.rolesSubject.value, (roleId: string) => {
				const role = find(this.allRoles, (_role: Role) => {
					return _role.id === roleId;
				});

				if (role) {
					this.assignedRoles.push(role);
					remove(this.unassignedRoles, (el) => el.id === role.id);
				}
			});
		});
	}

	/**
	 * Assign role
	 */
	assignRole() {

		if (!this.roleIdForAdding) {
			return;
		}

		const role = find(this.allRoles, (_role: Role) => {
			return _role.id === (this.roleIdForAdding);
		});

		if (role) {
			this.assignedRoles.push(role);
			remove(this.unassignedRoles, (el) => el.id === role.id);
			this.roleIdForAdding = '';
			this.updateRoles();
		}
	}

	unassingRole(role: Role) {
		this.roleIdForAdding = '';
		this.unassignedRoles.push(role);
		remove(this.assignedRoles, el => el.id === role.id);
		this.updateRoles();
	}

	updateRoles() {
		const _roles = [];
		each(this.assignedRoles, elem => _roles.push(elem.id));
		this.rolesSubject.next(_roles);
	}
}
