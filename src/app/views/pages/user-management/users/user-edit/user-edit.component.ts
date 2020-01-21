// Angular
import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
// RxJS
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
// NGRX
import { Store, select } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { AppState } from '../../../../../core/reducers';
// Layout
import { SubheaderService, LayoutConfigService } from '../../../../../core/_base/layout';
import { LayoutUtilsService, MessageType } from '../../../../../core/_base/crud';
// Services and Models
import {
	User,
	UserUpdated,
	Address,
	SocialNetworks,
	selectHasUsersInStore,
	selectUserById,
	UserOnServerCreated,
	selectLastCreatedUserId,
	selectUsersActionLoading,

	AuthService,
	Role
} from '../../../../../core/auth';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiResponse } from '../../../../../core/medelit';
import { MatTableDataSource, MatSort, MatPaginator } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
	selector: 'kt-user-edit',
	templateUrl: './user-edit.component.html',
})
export class UserEditComponent implements OnInit, OnDestroy {
	debouncer: any;
	intercepting = false;
	user: User;
	userId$: Observable<number>;
	oldUser: User;
	selectedTab = 0;
	loading$: Observable<boolean>;

	@ViewChild(MatSort, { static: true }) sort: MatSort;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	displayedColumns: string[] = ['select', 'id', 'name'];
	rolesDataSource = new MatTableDataSource<Role>();
	selection = new SelectionModel<Role>(true, []);
	userForm: FormGroup;
	hasFormErrors = false;
	// Private properties
	private subscriptions: Subscription[] = [];

	constructor(private activatedRoute: ActivatedRoute,
		private router: Router,
		private userFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private userService: AuthService,
		private spinner: NgxSpinnerService,
		private cdr: ChangeDetectorRef,
		private layoutConfigService: LayoutConfigService) { }

	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectUsersActionLoading));

		const routeSubscription = this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.loadUserFromService(id);
				this.store.pipe(select(selectUserById(id))).subscribe(res => {
					if (res) {
						this.user = res;
						this.oldUser = Object.assign({}, this.user);
						this.initUser();
					}
				});
			} else {
				this.user = new User();
				this.user.clear();
				this.oldUser = Object.assign({}, this.user);
				this.initUser();
			}
		});
		this.subscriptions.push(routeSubscription);
	}


	loadUserFromService(id: string) {
		this.spinner.show();
		this.userService.getUserById(id).toPromise().then((res) => {
			this.user = (res as unknown as ApiResponse).data;
			this.loadRoles(this.user.roles);
			this.oldUser = Object.assign({}, this.user);
			this.initUser();
		}).catch((e) => {
			this.spinner.hide();
		}).finally(() => {
			this.spinner.hide();

		});
	}
	loadRoles(userRoles: string[]) {
		this.spinner.show();
		this.userService.getAllRoles().toPromise().then((res) => {
			var roles = res as unknown as ApiResponse;
			this.rolesDataSource = new MatTableDataSource<Role>(roles.data);
			this.rolesDataSource.paginator = this.paginator;
			this.rolesDataSource.sort = this.sort;

			if (userRoles.length > 0) {
				var selected = userRoles;
				this.rolesDataSource.data.forEach((row) => {
					if (selected.indexOf(row.id) > -1)
						this.selection.select(row);
				});
			}
			this.cdr.detectChanges();

		}).catch(() => {
			this.spinner.hide();
		}).finally(() => {
			this.spinner.hide();
		})
	}

	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	/**
	 * Init user
	 */
	initUser() {
		this.createForm();
		if (!this.user.id) {
			this.subheaderService.setTitle('Create user');
			this.subheaderService.setBreadcrumbs([
				{ title: 'User Management', page: `user-management` },
				{ title: 'Users', page: `user-management/users` },
				{ title: 'Create user', page: `user-management/users/add` }
			]);
			return;
		}
		this.subheaderService.setTitle('Edit user');
		this.subheaderService.setBreadcrumbs([
			{ title: 'User Management', page: `user-management` },
			{ title: 'Users', page: `user-management/users` },
			{ title: 'Edit user', page: `user-management/users/edit`, queryParams: { id: this.user.id } }
		]);
	}

	/**
	 * Create form
	 */
	createForm() {
		this.userForm = this.userFB.group({
			userName: [this.user.userName, [Validators.pattern(/^([A-z0-9!@#$%^&*().,<>{}[\]<>?_=+\-|;:\'\"\/])*[^\s]\1*$/)]],
			firstName: [this.user.firstName, [Validators.required]],
			lastName: [this.user.lastName, [Validators.required]],
			password: [this.user.password, [Validators.minLength(5), Validators.maxLength(20)]],
			email: [this.user.email, Validators.compose([Validators.required, Validators.email]), this.isEmailUnique.bind(this)],
			phoneNumber: [this.user.phoneNumber, [Validators.minLength(5), Validators.maxLength(20)]]
		});

		if (this.user.id == null)
			this.userForm.get('password').setValidators([Validators.required]);

	}

	isEmailUnique(control: FormControl) {
		clearTimeout(this.debouncer);
		this.intercepting = true;
		const q = new Promise((resolve, reject) => {
			setTimeout(() => {
				this.userService.isEmailRegisterd(control.value, this.user.id).subscribe((res: ApiResponse) => {
					if (res.data == 0) {
						resolve(null);
					} else {
						resolve({ 'isEmailUnique': true });
					}
				}, (err) => {
					resolve({ 'isEmailUnique': true });
				}, () => {
					this.intercepting = false;
				});
			}, 1000);
		});
		return q;
	}

	goBackWithId() {
		const url = `/user-management/users`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	refreshUser(isNew: boolean = false, id = '') {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/user-management/users/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	reset() {
		this.user = Object.assign({}, this.oldUser);
		this.createForm();
		this.hasFormErrors = false;
		this.userForm.markAsPristine();
		this.userForm.markAsUntouched();
		this.userForm.updateValueAndValidity();
	}

	onSumbit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.userForm.controls;
		/** check form */
		if (this.userForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		const editedUser = this.prepareUser();

		if (editedUser.id) {
			this.updateUser(editedUser, withBack);
			return;
		}

		this.addUser(editedUser, withBack);
	}

	prepareUser(): User {
		const controls = this.userForm.controls;
		const _user = new User();
		_user.clear();
		_user.roles = this.selection.selected.map((e) => { return e.name; });
		_user.pic = this.user.pic;
		_user.id = this.user.id;
		//_user.userName = controls.userName.value;
		_user.email = controls.email.value;
		_user.firstName = controls.firstName.value;
		_user.lastName = controls.lastName.value;
		_user.phoneNumber = controls.phoneNumber.value;
		_user.password = controls.password.value;
		return _user;
	}

	addUser(_user: User, withBack: boolean = false) {
		this.spinner.show();
		this.userService.createUser(_user).toPromise()
			.then((res) => {
				var resp = res as unknown as ApiResponse;
				if (resp.success) {
					const message = `New user successfully has been added.`;
					this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);

					const newId = resp.data.id;
					if (newId) {
						if (withBack) {
							this.goBackWithId();
						} else {
							this.refreshUser(true, newId);
						}
					}
				} else {
					const message = resp.errors.join('<br/>');
					this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				}


			}).catch(() => {
				this.spinner.hide();
				this.layoutUtilsService.showActionNotification('A network error occured while processing your request. Please try again later.', MessageType.Create, 5000, true, true);

			}).finally(() => {
				this.spinner.hide();
			});



		//this.store.dispatch(new UserOnServerCreated({ user: _user }));
		//const addSubscription = this.store.pipe(select(selectLastCreatedUserId)).subscribe(newId => {
		//	const message = `New user successfully has been added.`;
		//	this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
		//	if (newId) {
		//		if (withBack) {
		//			this.goBackWithId();
		//		} else {
		//			this.refreshUser(true, newId);
		//		}
		//	}
		//});
		//this.subscriptions.push(addSubscription);
	}

	updateUser(_user: User, withBack: boolean = false) {
		this.spinner.show();
		this.userService.updateUser(_user).toPromise()
			.then((res) => {
				var resp = res as unknown as ApiResponse;
				if (resp.success) {
					const message = `User updated successfully.`;
					this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);

					if (withBack) {
						this.goBackWithId();
					} else {
						this.refreshUser(true, this.user.id);
					}

				} else {
					const message = resp.errors.join('<br/>');
					this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				}

			}).catch(() => {
				this.spinner.hide();
				this.layoutUtilsService.showActionNotification('A network error occured while processing your request. Please try again later.', MessageType.Create, 5000, true, true);

			}).finally(() => {
				this.spinner.hide();
			});

		// Update User

		// tslint:disable-next-line:prefer-const
		//const updatedUser: Update<User> = {
		//	id: _user.id,
		//	changes: _user
		//};
		//this.store.dispatch(new UserUpdated({ partialUser: updatedUser, user: _user }));
		//const message = `User successfully has been saved.`;
		//this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
		//if (withBack) {
		//	this.goBackWithId();
		//} else {
		//	this.refreshUser(false);
		//}
	}

	getComponentTitle() {
		let result = 'Create user';
		if (!this.user || !this.user.id) {
			return result;
		}

		result = `Edit user - ${this.user.firstName} ${this.user.lastName}`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}


	isAllSelected() {
		const numSelected = this.selection.selected.length;
		const numRows = this.rolesDataSource.data.length;
		return numSelected === numRows;
	}

	masterToggle() {
		this.isAllSelected() ?
			this.selection.clear() :
			this.rolesDataSource.data.forEach(row => this.selection.select(row));
	}

	checkboxLabel(row?: Role): string {
		if (!row) {
			return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
		}
		return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
	}

}
