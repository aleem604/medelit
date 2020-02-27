// Angular
import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// Material
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
// RXJS
import { debounceTime, distinctUntilChanged, tap, skip, delay, startWith, map } from 'rxjs/operators';
import { fromEvent, merge, Observable, of, Subscription, BehaviorSubject } from 'rxjs';
// NGRX
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../../core/reducers';
// UI
import { SubheaderService } from '../../../../../core/_base/layout';
// CRUD
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../../core/_base/crud';
// Services and Models

import { FormControl } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { BookingDataSource, FilterModel, BookingModel, StaticDataService, BookingService, BookingsPageRequested, OneBookingDeleted, ManyBookingsDeleted, BookingsStatusUpdated, InvoicesService } from '../../../../../core/medelit';
import { selectBookingsPageLastQuery } from '../../../../../core/medelit/_selectors/booking.selectors';


@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-bookings-list',
	templateUrl: './bookings-list.component.html',
	styleUrls: ['bookings-list.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookingsListComponent implements OnInit, OnDestroy {
	// Table fields
	dataSource: BookingDataSource;
	displayedColumns = ['select', 'name', 'customer', 'invoicingEntity', 'service', 'professional', 'bookingDate', 'visitDate', 'visitTime', 'paymentMethod', 'ptFee', 'actions'];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild('sort1', { static: true }) sort: MatSort;
	loadingSubject = new BehaviorSubject<boolean>(true);
	// Filter fields
	filterStatus: string = '';
	filterCondition: string = '';
	lastQuery: QueryParamsModel;
	@ViewChild('searchInput', { static: true }) searchInput: ElementRef;

	statusControl = new FormControl('0', []);

	// Selection
	selection = new SelectionModel<BookingModel>(true, []);
	bookingsResult: BookingModel[] = [];
	private subscriptions: Subscription[] = [];

	constructor(public dialog: MatDialog,
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private subheaderService: SubheaderService,
		private utilService: StaticDataService,
		private layoutUtilsService: LayoutUtilsService,
		private spinner: NgxSpinnerService,
		private bookingService: BookingService,
		private invoiceService: InvoicesService,
		private cdr: ChangeDetectorRef,
		private store: Store<AppState>) { }


	ngOnInit() {
		// If the user changes the sort order, reset back to the first page.
		const sortSubscription = this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
		this.subscriptions.push(sortSubscription);

		const paginatorSubscriptions = merge(this.sort.sortChange, this.paginator.page, this.statusControl.valueChanges).pipe(
			tap(() => this.loadBookingsList())
		)
			.subscribe();
		this.subscriptions.push(paginatorSubscriptions);

		// Filtration, bind to searchInput
		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			debounceTime(150),
			distinctUntilChanged(),
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadBookingsList();
			})
		)
			.subscribe();
		this.subscriptions.push(searchSubscription);

		// Set title to page breadCrumbs
		this.subheaderService.setTitle('Bookings');

		// Init DataSource
		this.dataSource = new BookingDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.bookingsResult = res;
		});
		this.subscriptions.push(entitiesSubscription);
		const lastQuerySubscription = this.store.pipe(select(selectBookingsPageLastQuery)).subscribe(res => this.lastQuery = res);
		// Load last query from store
		this.subscriptions.push(lastQuerySubscription);

		// Read from URL itemId, for restore previous state
		const routeSubscription = this.activatedRoute.queryParams.subscribe(params => {
			if (params.id) {
				this.restoreState(this.lastQuery, +params.id);
			}

			// First load
			of(undefined).pipe(delay(1000)).subscribe(() => { // Remove this line, just loading imitation
				this.loadBookingsList();
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

	/**
	 * Load bookings List
	 */
	loadBookingsList() {
		this.selection.clear();
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex,
			this.paginator.pageSize
		);
		// Call request from server
		this.store.dispatch(new BookingsPageRequested({ page: queryParams }));
		this.selection.clear();
	}

	filterConfiguration(): any {
		const filter: any = {};
		try {
			const searchText = this.searchInput.nativeElement.value;
			const bookingFilter = this.statusControl.value;

			if (bookingFilter) {
				filter.bookingFilter = bookingFilter;
			}

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

	deleteBooking(_item: BookingModel) {
		const _title = 'Booking Delete';
		const _description = 'Are you sure to permanently delete this booking?';
		const _waitDesciption = 'Booking is deleting...';
		const _deleteMessage = `Booking has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.store.dispatch(new OneBookingDeleted({ id: _item.id }));
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
		});
	}

	deleteBookings() {
		const _title = 'Bookings Delete';
		const _description = 'Are you sure to permanently delete selected bookings?';
		const _waitDesciption = 'Bookings are deleting...';
		const _deleteMessage = 'Selected bookings have been deleted';

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
			this.store.dispatch(new ManyBookingsDeleted({ ids: idsForDeletion }));
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
			this.selection.clear();
		});
	}

	fetchBookings() {
		// tslint:disable-next-line:prefer-const
		let messages = [];
		this.selection.selected.forEach(elem => {
			messages.push({
				text: `${elem.id} ${elem.name}`,
				id: elem.id,
				status: elem.status
			});
		});
		this.layoutUtilsService.fetchElements(messages);
	}


	updateStatusForBookings() {
		const _title = 'Update status for selected bookings';
		const _updateMessage = 'Status has been updated for selected bookings';
		const _statuses = [{ value: 0, text: 'Pending' }, { value: 1, text: 'Active' }, { value: 2, text: 'Suspended' }];
		const _messages = [];

		this.selection.selected.forEach(elem => {
			_messages.push({
				text: `${elem.id} ${elem.name}`,
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

			this.store.dispatch(new BookingsStatusUpdated({
				status: +res,
				bookings: this.selection.selected
			}));

			this.layoutUtilsService.showActionNotification(_updateMessage, MessageType.Update);
			this.selection.clear();
		});
	}

	editBooking(id) {
		this.router.navigate(['../bookings/edit', id], { relativeTo: this.activatedRoute });
	}

	createInvoice(booking: BookingModel) {
		this.spinner.show();
		this.invoiceService.createInvoiceFromBooking(booking.id).toPromise().then((res) => {
			this.spinner.hide();
			const message = `New invoice created successfully.`;
			this.layoutUtilsService.showActionNotification(message, MessageType.Create, 30000, true, true);

		}).catch((e) => {
			this.spinner.hide();
			const message = `An error occured while processing your request. Please try again later.`;
			this.layoutUtilsService.showActionNotification(message, MessageType.Create, 50000, true, true);
		});


	}

	isAllSelected() {
		const numSelected = this.selection.selected.length;
		const numRows = this.bookingsResult.length;
		return numSelected === numRows;
	}

	masterToggle() {
		if (this.isAllSelected()) {
			this.selection.clear();
		} else {
			this.bookingsResult.forEach(row => this.selection.select(row));
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
