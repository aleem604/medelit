import { Component, OnInit, ViewChild, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Input, OnChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { distinctUntilChanged, skip, delay, tap, debounceTime } from 'rxjs/operators';
import { of, Subscription, BehaviorSubject, merge } from 'rxjs';
import { Store, select } from '@ngrx/store';
import {BookingModel, BookingsPageRequested, BookingDataSource } from '../../../../core/medelit';
import { QueryParamsModel } from '../../../../core/_base/crud';
import { AppState } from '../../../../core/reducers';
import { selectBookingsPageLastQuery } from '../../../../core/medelit/_selectors/booking.selectors';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-search-bookings',
	templateUrl: './search-bookings.component.html',
	styleUrls: ['search-bookings.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchBookingsComponent implements OnInit, OnDestroy, OnChanges {
	@Input() searchInput: string;
	dataSource: BookingDataSource;
	displayedColumns = ['name', 'customer', 'invoicingEntity', 'service', 'professional', 'bookingDate', 'visitDate', 'paymentMethod', 'ptFee', 'assignedTo'];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild('sort1', { static: true }) sort: MatSort;
	loadingSubject = new BehaviorSubject<boolean>(true);
	lastQuery: QueryParamsModel;

	// Selection
	selection = new SelectionModel<BookingModel>(true, []);
	bookingsResult: BookingModel[] = [];
	private subscriptions: Subscription[] = [];

	constructor(public dialog: MatDialog,
		private activatedRoute: ActivatedRoute,
		private cdr: ChangeDetectorRef,
		private store: Store<AppState>) { }


	ngOnInit() {
		// If the user changes the sort order, reset back to the first page.
		const sortSubscription = this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
		this.subscriptions.push(sortSubscription);

		const paginatorSubscriptions = merge(this.sort.sortChange, this.paginator.page).pipe(
			tap(() => this.loadBookingsList())
		)
			.subscribe();
		this.subscriptions.push(paginatorSubscriptions);

		this.dataSource = new BookingDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			debounceTime(300),
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
	ngOnDestroy() {
		this.subscriptions.forEach(el => el.unsubscribe());
	}

	ngOnChanges() {

		this.paginator.pageIndex = 0;
		this.loadBookingsList();
	}


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
			const searchText = this.searchInput;			
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
	}

	detectChanges() {
		try {
			this.cdr.detectChanges();
		} catch (e) {

		}
	}

	/* csv file upload */



}
