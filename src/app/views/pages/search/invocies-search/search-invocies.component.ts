import { Component, OnInit, ViewChild, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Input, OnChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { distinctUntilChanged, skip, delay } from 'rxjs/operators';
import { of, Subscription, BehaviorSubject } from 'rxjs';
import { Store, select } from '@ngrx/store';
import {InvoiceModel, InvoicesPageRequested, InvoiceDataSource, selectInvoicesPageLastQuery } from '../../../../core/medelit';
import { QueryParamsModel } from '../../../../core/_base/crud';
import { AppState } from '../../../../core/reducers';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-search-invocies',
	templateUrl: './search-invocies.component.html',
	styleUrls: ['search-invocies.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchInvociesComponent implements OnInit, OnDestroy, OnChanges {
	@Input() searchInput: string;
	dataSource: InvoiceDataSource;
	displayedColumns = ['invoiceNumber', 'createDate', 'customer', 'invoiceEntity', 'status', 'paymentStatus', 'paymentMethod', 'dateOfVisit', 'amount', 'assignedTo', 'actions'];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild('sort1', { static: true }) sort: MatSort;
	loadingSubject = new BehaviorSubject<boolean>(true);
	lastQuery: QueryParamsModel;

	// Selection
	selection = new SelectionModel<InvoiceModel>(true, []);
	bookingsResult: InvoiceModel[] = [];
	private subscriptions: Subscription[] = [];

	constructor(public dialog: MatDialog,
		private activatedRoute: ActivatedRoute,
		private cdr: ChangeDetectorRef,
		private store: Store<AppState>) { }


	ngOnInit() {
		// If the user changes the sort order, reset back to the first page.
		const sortSubscription = this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
		this.subscriptions.push(sortSubscription);


		// Init DataSource
		this.dataSource = new InvoiceDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.bookingsResult = res;
		});
		this.subscriptions.push(entitiesSubscription);
		const lastQuerySubscription = this.store.pipe(select(selectInvoicesPageLastQuery)).subscribe(res => this.lastQuery = res);
		// Load last query from store
		this.subscriptions.push(lastQuerySubscription);

		// Read from URL itemId, for restore previous state
		const routeSubscription = this.activatedRoute.queryParams.subscribe(params => {
			if (params.id) {
				this.restoreState(this.lastQuery, +params.id);
			}

			// First load
			of(undefined).pipe(delay(1000)).subscribe(() => { // Remove this line, just loading imitation
				this.loadInvoicesList();
			}); // Remove this line, just loading imitation
		});
		this.subscriptions.push(routeSubscription);
	}
	ngOnDestroy() {
		this.subscriptions.forEach(el => el.unsubscribe());
	}

	ngOnChanges() {

		this.paginator.pageIndex = 0;
		this.loadInvoicesList();
	}


	loadInvoicesList() {
		this.selection.clear();
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex,
			this.paginator.pageSize,
			true
		);
		// Call request from server
		this.store.dispatch(new InvoicesPageRequested({ page: queryParams }));
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
