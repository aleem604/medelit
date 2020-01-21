// Angular
import { Component, OnInit, Inject, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
// RxJS
import { Observable, of, Subscription} from 'rxjs';
// Lodash
import { each, find, some } from 'lodash';
// NGRX
import { Update } from '@ngrx/entity';
import { Store, select } from '@ngrx/store';
// State
import { AppState } from '../../../../../core/reducers';
// Services and Models
import {
	Role,
	selectRoleById,
	RoleUpdated,
	selectAllRoles,
	selectLastCreatedRoleId,
	RoleOnServerCreated
} from '../../../../../core/auth';
import { delay } from 'rxjs/operators';

@Component({
	selector: 'kt-role-edit-dialog',
	templateUrl: './role-edit.dialog.component.html',
	changeDetection: ChangeDetectionStrategy.Default,
})
export class RoleEditDialogComponent implements OnInit, OnDestroy {
	// Public properties
	role: Role;
	role$: Observable<Role>;
	hasFormErrors = false;
	viewLoading = false;
	loadingAfterSubmit = false;
	// Private properties
	private componentSubscriptions: Subscription;

	constructor(public dialogRef: MatDialogRef<RoleEditDialogComponent>,
		           @Inject(MAT_DIALOG_DATA) public data: any,
		           private store: Store<AppState>) { }

	ngOnInit() {
		if (this.data.roleId) {
			this.role$ = this.store.pipe(select(selectRoleById(this.data.roleId)));
		} else {
			const newRole = new Role();
			newRole.clear();
			this.role$ = of(newRole);
		}

		this.role$.subscribe(res => {
			if (!res) {
				return;
			}

			this.role = new Role();
			this.role.id = res.id;
			this.role.name = res.name;
			this.role.isCoreRole = res.isCoreRole;
		});
	}

	/**
	 * On destroy
	 */
	ngOnDestroy() {
		if (this.componentSubscriptions) {
			this.componentSubscriptions.unsubscribe();
		}
	}

	

	
	prepareRole(): Role {
		const _role = new Role();
		_role.id = this.role.id;
		_role.name = this.role.name;
		_role.isCoreRole = this.role.isCoreRole;
		return _role;
	}

	onSubmit() {
		this.hasFormErrors = false;
		this.loadingAfterSubmit = false;
		/** check form */
		if (!this.isTitleValid()) {
			this.hasFormErrors = true;
			return;
		}

		const editedRole = this.prepareRole();
		if (editedRole.id) {
			this.updateRole(editedRole);
		} else {
			this.createRole(editedRole);
		}
	}

	updateRole(_role: Role) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		/* Server loading imitation. Remove this on real code */
		const updateRole: Update<Role> = {
			id: this.role.id,
			changes: _role
		  };
		this.store.dispatch(new RoleUpdated({
			partialrole: updateRole,
			role: _role
		}));
		of(undefined).pipe(delay(1000)).subscribe(() => { // Remove this line
			this.viewLoading = false;
			this.dialogRef.close({
				_role,
				isEdit: true
			});
		}); // Remove this line
	}

	/**
	 * Create role
	 *
	 * @param _role: Role
	 */
	createRole(_role: Role) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.store.dispatch(new RoleOnServerCreated({ role: _role }));
		this.componentSubscriptions = this.store.pipe(
			delay(1000), // Remove this line
			select(selectLastCreatedRoleId)
		).subscribe(res => {
			if (!res) {
				return;
			}

			this.viewLoading = false;
			this.dialogRef.close({
				_role,
				isEdit: false
			});
		});
	}

	/**
	 * Close alert
	 *
	 * @param $event: Event
	 */
	onAlertClose($event) {
		this.hasFormErrors = false;
	}

	getTitle(): string {
		if (this.role && this.role.id) {
			// tslint:disable-next-line:no-string-throw
			return `Edit role '${this.role.name}'`;
		}

		// tslint:disable-next-line:no-string-throw
		return 'New role';
	}

	/**
	 * Returns is title valid
	 */
	isTitleValid(): boolean {
		return (this.role && this.role.name && this.role.name.length > 0);
	}
}
