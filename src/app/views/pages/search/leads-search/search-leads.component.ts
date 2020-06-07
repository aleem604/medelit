import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Input, OnChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { debounceTime, distinctUntilChanged, tap, skip, delay, startWith, map } from 'rxjs/operators';
import { fromEvent, merge, of, Subscription, BehaviorSubject } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { FormControl } from '@angular/forms';
import { LeadDataSource, LeadModel, LeadsPageRequested } from '../../../../core/medelit';
import { QueryParamsModel } from '../../../../core/_base/crud';
import { SubheaderService } from '../../../../core/_base/layout';
import { AppState } from '../../../../core/reducers';
import { selectLeadsPageLastQuery } from '../../../../core/medelit/_selectors/lead.selectors';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-search-leads',
	templateUrl: './search-leads.component.html',
	styleUrls: ['search-leads.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchLeadsComponent implements OnInit, OnDestroy, OnChanges {
	@Input() searchInput: string;
	dataSource: LeadDataSource;
	displayedColumns = ['surName', 'name', 'mainPhone', 'city', 'country', 'createDate', 'updateDate', 'assignedTo'];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild('sort1', { static: true }) sort: MatSort;
	lastQuery: QueryParamsModel;

	selection = new SelectionModel<LeadModel>(true, []);
	customersResult: LeadModel[] = [];
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
			tap(() => this.loadCustomersList())
		)
			.subscribe();
		this.subscriptions.push(paginatorSubscriptions);

		this.dataSource = new LeadDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.customersResult = res;
		});
		this.subscriptions.push(entitiesSubscription);
		const lastQuerySubscription = this.store.pipe(select(selectLeadsPageLastQuery)).subscribe(res => this.lastQuery = res);
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


	ngOnChanges() {
		this.paginator.pageIndex = 0;
		this.loadCustomersList();
	}

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
		this.store.dispatch(new LeadsPageRequested({ page: queryParams }));
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
