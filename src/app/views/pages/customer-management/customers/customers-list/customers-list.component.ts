// Angular
import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// Material
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
// RXJS
import { debounceTime, distinctUntilChanged, tap, skip, delay, startWith, map } from 'rxjs/operators';
import { fromEvent, merge, of, Subscription } from 'rxjs';
// NGRX
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../../core/reducers';
// UI
import { SubheaderService } from '../../../../../core/_base/layout';
// CRUD
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../../core/_base/crud';
// Services and Models
import {
	CustomerModel,
	CustomersDataSource,
	CustomersPageRequested,
	OneCustomerDeleted,
	ManyCustomersDeleted,
	CustomersStatusUpdated,
} from '../../../../../core/medelit';

import { CustomersService } from '../../../../../core/medelit/_services';
import { selectCustomersPageLastQuery } from '../../../../../core/medelit/_selectors/customer.selectors';
import { NgxSpinnerService } from 'ngx-spinner';


@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-customers-list',
	templateUrl: './customers-list.component.html',
	styleUrls: ['customers-list.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomersListComponent implements OnInit, OnDestroy {
	// Table fields
	dataSource: CustomersDataSource;
	displayedColumns = ['select', 'id', 'surName', 'name', 'phone', 'email', 'age', 'actions'];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild('sort1', { static: true }) sort: MatSort;
	// Filter fields
	filterStatus: string = '';
	filterCondition: string = '';
	lastQuery: QueryParamsModel;
	@ViewChild('searchInput', { static: true }) searchInput: ElementRef;

	selection = new SelectionModel<CustomerModel>(true, []);
	customersResult: CustomerModel[] = [];
	private subscriptions: Subscription[] = [];

	constructor(public dialog: MatDialog,
		private store: Store<AppState>,
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private cdr: ChangeDetectorRef,
		private customerService: CustomersService,
		private spinner: NgxSpinnerService
	) { }

	ngOnInit() {
		// If the user changes the sort order, reset back to the first page.
		const sortSubscription = this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
		this.subscriptions.push(sortSubscription);

		const paginatorSubscriptions = merge(this.sort.sortChange, this.paginator.page).pipe(
			tap(() => this.loadCustomersList())
		)
			.subscribe();
		this.subscriptions.push(paginatorSubscriptions);

		// Filtration, bind to searchInput
		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			debounceTime(300),
			distinctUntilChanged(),
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadCustomersList();
			})
		)
			.subscribe();
		this.subscriptions.push(searchSubscription);

		// Set title to page breadCrumbs
		this.subheaderService.setTitle('Customers');

		// Init DataSource
		this.dataSource = new CustomersDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.customersResult = res;
		});
		this.subscriptions.push(entitiesSubscription);
		const lastQuerySubscription = this.store.pipe(select(selectCustomersPageLastQuery)).subscribe(res => this.lastQuery = res);
		// Load last query from store
		this.subscriptions.push(lastQuerySubscription);

		// Read from URL itemId, for restore previous state
		const routeSubscription = this.activatedRoute.queryParams.subscribe(params => {
			if (params.id) {
				this.restoreState(this.lastQuery, +params.id);
			}

			// First load
			of(undefined).pipe(delay(1000)).subscribe(() => { // Remove this line, just loading imitation
				this.loadCustomersList();
			}); // Remove this line, just loading imitation
		});
		this.subscriptions.push(routeSubscription);
	}

	/**
	 * On Destroy
	 */
	ngOnDestroy() {
		this.subscriptions.forEach(el => el.unsubscribe());
	}

	loadCustomersList() {
		this.selection.clear();
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex,
			this.paginator.pageSize
		);
		this.store.dispatch(new CustomersPageRequested({ page: queryParams }));
		this.selection.clear();
	}

	filterConfiguration(): any {
		const filter: any = {};
		try {
			const searchText = this.searchInput.nativeElement.value;
			if (searchText)
				filter.search = searchText;
		} catch{

		}
		return filter;
	}

	restoreState(queryParams: QueryParamsModel, id: number) {

		if (!queryParams.filter) {
			return;
		}

		if ('condition' in queryParams.filter) {
			this.filterCondition = queryParams.filter.condition.toString();
		}

		if ('status' in queryParams.filter) {
			this.filterStatus = queryParams.filter.status.toString();
		}

		if (queryParams.filter.model) {
			this.searchInput.nativeElement.value = queryParams.filter.model;
		}
	}

	deleteCustomer(_item: CustomerModel) {
		const _title = 'Customer Delete';
		const _description = 'Are you sure to permanently delete this customer?';
		const _waitDesciption = 'Customer is deleting...';
		const _deleteMessage = `Customer has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.store.dispatch(new OneCustomerDeleted({ id: _item.id }));
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
		});
	}

	deleteCustomers() {
		const _title = 'Customers Delete';
		const _description = 'Are you sure to permanently delete selected customers?';
		const _waitDesciption = 'Customers are deleting...';
		const _deleteMessage = 'Selected customers have been deleted';

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			const idsForDeletion: number[] = [];
			// tslint:disable-next-line:prefer-for-of
			for (let i = 0; i < this.selection.selected.length; i++) {
				idsForDeletion.push(this.selection.selected[i].id);
			}
			this.store.dispatch(new ManyCustomersDeleted({ ids: idsForDeletion }));
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
			this.selection.clear();
		});
	}

	/**
	 * Fetch selected customers
	 */
	fetchCustomers() {
		// tslint:disable-next-line:prefer-const
		let messages = [];
		this.selection.selected.forEach(elem => {
			messages.push({
				text: `${elem.title} ${elem.name} ${elem.mainPhone}`,
				id: elem.id,
				status: elem.status
			});
		});
		this.layoutUtilsService.fetchElements(messages);
	}

	/**
	 * Update status dialog
	 */
	updateStatusForCustomers() {
		const _title = 'Update status for selected customers';
		const _updateMessage = 'Status has been updated for selected customers';
		const _statuses = [{ value: 0, text: 'Pending' }, { value: 1, text: 'Active' }, { value: 2, text: 'Suspended' }];
		const _messages = [];

		this.selection.selected.forEach(elem => {
			_messages.push({
				text: `${elem.title} ${elem.name} ${elem.mainPhone}`,
				id: elem.id,
				status: elem.status,
				statusTitle: this.getItemStatusString(elem.status),
				statusCssClass: this.getItemCssClassByStatus(elem.status)
			});
		});

		const dialogRef = this.layoutUtilsService.updateStatusForEntities(_title, _statuses, _messages);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				this.selection.clear();
				return;
			}

			this.store.dispatch(new CustomersStatusUpdated({
				status: +res,
				customers: this.selection.selected
			}));

			this.layoutUtilsService.showActionNotification(_updateMessage, MessageType.Update);
			this.selection.clear();
		});
	}

	editCustomer(id) {
		this.router.navigate(['../customers/edit', id], { relativeTo: this.activatedRoute });
	}

	createCustomer() {
		this.router.navigateByUrl('/customer-management/customers/add');
	}

	convertToBooking(customer: CustomerModel) {
		this.spinner.show();
		this.customerService.convertToBooking(customer).toPromise().then((res) => {
			this.spinner.hide();
			if (res.success && res.data > 0) {
				const message = `Booking created successfully.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 10000, true, true);
			}

		}).catch((err) => {
			this.spinner.hide();
			const message = `An error occured. Please try again later.`;
			this.layoutUtilsService.showActionNotification(message, MessageType.Create, 10000, true, true);
		})





	}

	createLead(customer: CustomerModel) {
		this.router.navigateByUrl(`/lead-management/leads/add?fromCustomer=${customer.id}`);
	}

	isAllSelected() {
		const numSelected = this.selection.selected.length;
		const numRows = this.customersResult.length;
		return numSelected === numRows;
	}

	masterToggle() {
		if (this.isAllSelected()) {
			this.selection.clear();
		} else {
			this.customersResult.forEach(row => this.selection.select(row));
		}
	}

	getItemStatusString(status: number = 0): string {
		switch (status) {
			case 0:
				return 'Pending';
			case 1:
				return 'Active';
			case 2:
				return 'Suspended';
		}
		return '';
	}

	getItemCssClassByStatus(status: number = 0): string {
		switch (status) {
			case 0:
				return 'metal';
			case 1:
				return 'success';
			case 2:
				return 'danger';
		}
		return '';
	}

	getItemConditionString(condition: number = 0): string {
		switch (condition) {
			case 0:
				return 'New';
			case 1:
				return 'Used';
		}
		return '';
	}

	getItemCssClassByCondition(condition: number = 0): string {
		switch (condition) {
			case 0:
				return 'accent';
			case 1:
				return 'primary';
		}
		return '';
	}

	detectChanges() {
		try {
			this.cdr.detectChanges();
		} catch (e) {

		}
	}
}
