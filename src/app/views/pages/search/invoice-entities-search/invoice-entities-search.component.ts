import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Input, OnChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { distinctUntilChanged, tap, skip, delay } from 'rxjs/operators';
import { merge, of, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { InvoiceEntitiesPageRequested, InvoiceEntityDataSource, selectInvoiceEntitiesPageLastQuery, InvoiceEntityModel } from '../../../../core/medelit';
import { QueryParamsModel } from '../../../../core/_base/crud';
import { AppState } from '../../../../core/reducers';


@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-invoice-entities-search',
	templateUrl: './invoice-entities-search.component.html',
	styleUrls: ['invoice-entities-search.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvoiceEntitiesSearchComponent implements OnInit, OnDestroy, OnChanges {
	@Input() searchInput: string;
	dataSource: InvoiceEntityDataSource;
	displayedColumns = ['name', 'ieType', 'rating', 'phone', 'email', 'city', 'country', 'updateDate', 'assignedTo'];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild('sort1', { static: true }) sort: MatSort;
	lastQuery: QueryParamsModel;

	selection = new SelectionModel<InvoiceEntityModel>(true, []);
	customersResult: InvoiceEntityModel[] = [];
	private subscriptions: Subscription[] = [];

	constructor(public dialog: MatDialog,
		private store: Store<AppState>,
		private activatedRoute: ActivatedRoute,
		private cdr: ChangeDetectorRef,
	) { }

	ngOnInit() {
		// If the user changes the sort order, reset back to the first page.
		const sortSubscription = this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
		this.subscriptions.push(sortSubscription);

		const paginatorSubscriptions = merge(this.sort.sortChange, this.paginator.page).pipe(
			tap(() => this.loadInvoiceEntitiesList())
		)
			.subscribe();
		this.subscriptions.push(paginatorSubscriptions);

		this.dataSource = new InvoiceEntityDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.customersResult = res;
		});
		this.subscriptions.push(entitiesSubscription);
		const lastQuerySubscription = this.store.pipe(select(selectInvoiceEntitiesPageLastQuery)).subscribe(res => this.lastQuery = res);
		// Load last query from store
		this.subscriptions.push(lastQuerySubscription);

		// Read from URL itemId, for restore previous state
		const routeSubscription = this.activatedRoute.queryParams.subscribe(params => {
			if (params.id) {
				this.restoreState(this.lastQuery, +params.id);
			}

			// First load
			of(undefined).pipe(delay(1000)).subscribe(() => { // Remove this line, just loading imitation
				this.loadInvoiceEntitiesList();
			}); // Remove this line, just loading imitation
		});
		this.subscriptions.push(routeSubscription);
	}


	ngOnChanges() {
		this.paginator.pageIndex = 0;
		this.loadInvoiceEntitiesList();
	}

	ngOnDestroy() {
		this.subscriptions.forEach(el => el.unsubscribe());
	}

	loadInvoiceEntitiesList() {
		this.selection.clear();
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex,
			this.paginator.pageSize
		);
		this.store.dispatch(new InvoiceEntitiesPageRequested({ page: queryParams }));
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

		if (queryParams.filter.model) {
			this.searchInput = queryParams.filter.model;
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
