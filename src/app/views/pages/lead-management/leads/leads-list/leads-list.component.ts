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
import {
	LeadModel,
	LeadDataSource,
	LeadsPageRequested,
	OneLeadDeleted,
	ManyLeadsDeleted,
	LeadsStatusUpdated,
	FilterModel,
} from '../../../../../core/medelit';
import { selectLeadsPageLastQuery } from '../../../../../core/medelit/_selectors/lead.selectors';
import { FormControl } from '@angular/forms';
import { StaticDataService, LeadsService } from '../../../../../core/medelit/_services';
import { transcode } from 'buffer';
import { NgxSpinnerService } from 'ngx-spinner';
import { LeadServicesModel } from '../../../../../core/medelit/_models/lead.model';


@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-leads-list',
	templateUrl: './leads-list.component.html',
	styleUrls: ['leads-list.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class LeadsListComponent implements OnInit, OnDestroy {
	// Table fields
	dataSource: LeadDataSource;
	displayedColumns = ['select', 'id', 'title', 'surName', 'name', 'language', 'phone', 'services', 'professionals', 'updateDate','status', 'actions'];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild('sort1', { static: true }) sort: MatSort;
	loadingSubject = new BehaviorSubject<boolean>(true);
	// Filter fields
	filterStatus: string = '';
	filterCondition: string = '';
	lastQuery: QueryParamsModel;
	@ViewChild('searchInput', { static: true }) searchInput: ElementRef;

	statusesForFilter: FilterModel[] = [];
	statusControl = new FormControl({ id: -1 }, []);
	filteredStatuses: Observable<FilterModel[]>;

	countriesForFilter: FilterModel[] = [];
	countryControl = new FormControl();
	filteredCountries: Observable<FilterModel[]>;

	regionsForFilter: FilterModel[] = [];
	regionControl = new FormControl();
	filteredRegions: Observable<FilterModel[]>;

	citiesForFilter: FilterModel[] = [];
	cityControl = new FormControl();
	filteredCities: Observable<FilterModel[]>;

	neighborhoodsForFilter: FilterModel[] = [];
	neighborhoodControl = new FormControl();
	filteredNeighborhoods: Observable<FilterModel[]>;

	// Selection
	selection = new SelectionModel<LeadModel>(true, []);
	leadsResult: LeadModel[] = [];
	private subscriptions: Subscription[] = [];

	constructor(public dialog: MatDialog,
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private subheaderService: SubheaderService,
		private utilService: StaticDataService,
		private layoutUtilsService: LayoutUtilsService,
		private spinner: NgxSpinnerService,
		private leadService: LeadsService,
		private cdr: ChangeDetectorRef,
		private store: Store<AppState>) { }


	ngOnInit() {
		this.loadStatusesForFilter();
		// If the user changes the sort order, reset back to the first page.
		const sortSubscription = this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
		this.subscriptions.push(sortSubscription);

		const paginatorSubscriptions = merge(this.sort.sortChange, this.paginator.page).pipe(
			tap(() => this.loadLeadsList())
		)
			.subscribe();
		this.subscriptions.push(paginatorSubscriptions);

		// Filtration, bind to searchInput
		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			debounceTime(150),
			distinctUntilChanged(),
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadLeadsList();
			})
		)
			.subscribe();
		this.subscriptions.push(searchSubscription);

		// Set title to page breadCrumbs
		this.subheaderService.setTitle('Leads');

		// Init DataSource
		this.dataSource = new LeadDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.leadsResult = res;
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
				this.loadLeadsList();
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
	 * Load leads List
	 */
	loadLeadsList() {
		this.selection.clear();
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex,
			this.paginator.pageSize
		);
		// Call request from server
		this.store.dispatch(new LeadsPageRequested({ page: queryParams }));
		this.selection.clear();
	}

	filterConfiguration(): any {
		const filter: any = {};
		try {
			const searchText = this.searchInput.nativeElement.value;
			const status = this.statusControl.value;

			if (status) {
				filter.status = status.id;
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

	deleteLead(_item: LeadModel) {
		const _title = 'Lead Delete';
		const _description = 'Are you sure to permanently delete this lead?';
		const _waitDesciption = 'Lead is deleting...';
		const _deleteMessage = `Lead has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.store.dispatch(new OneLeadDeleted({ id: _item.id }));
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
		});
	}

	deleteLeads() {
		const _title = 'Leads Delete';
		const _description = 'Are you sure to permanently delete selected leads?';
		const _waitDesciption = 'Leads are deleting...';
		const _deleteMessage = 'Selected leads have been deleted';

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
			this.store.dispatch(new ManyLeadsDeleted({ ids: idsForDeletion }));
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
			this.selection.clear();
		});
	}

	fetchLeads() {
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

	updateStatusForLeads() {
		const _title = 'Update status for selected leads';
		const _updateMessage = 'Status has been updated for selected leads';
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

			this.store.dispatch(new LeadsStatusUpdated({
				status: +res,
				leads: this.selection.selected
			}));

			this.layoutUtilsService.showActionNotification(_updateMessage, MessageType.Update);
			this.selection.clear();
		});
	}

	editLead(id) {
		this.router.navigate(['../leads/edit', id], { relativeTo: this.activatedRoute });
	}

	createLead() {
		this.router.navigateByUrl('/lead-management/leads/add');
	}



	isAllSelected() {
		const numSelected = this.selection.selected.length;
		const numRows = this.leadsResult.length;
		return numSelected === numRows;
	}

	masterToggle() {
		if (this.isAllSelected()) {
			this.selection.clear();
		} else {
			this.leadsResult.forEach(row => this.selection.select(row));
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

	/* Top Filters */

	loadStatusesForFilter() {
		this.utilService.getStatuses().subscribe(res => {
			this.statusesForFilter = res.data;
			this.filteredStatuses = this.statusControl.valueChanges
				.pipe(
					startWith(''),
					map(value => this._filterStatuses(value))
				);
		},
			(error) => { console.log(error); },
			() => {
				this.statusControl.setValue({ id: -1, name: 'All' });
				this.detectChanges();
			});
	}

	

	private _filterStatuses(value: string): FilterModel[] {
		const filterValue = this._normalizeValue(value);
		return this.statusesForFilter.filter(status => this._normalizeValue(status.value).includes(filterValue));
	}

	

	private _normalizeValue(value: string): string {
		if (value && value.length > 0)
			return value.toLowerCase().replace(/\s/g, '');
		return value;
	}

	displayFn(option: FilterModel): string {
		if (option)
			return option.value;
		return '';
	}

	statusDrpClosed() {
		this.loadLeadsList();
	}

	countryDrpClosed() {
		if (!this.countryControl.value) {
			this.regionControl.setValue('');
			this.cityControl.setValue('');
			this.neighborhoodControl.setValue('');

		}
		this.loadLeadsList();
	}

	/*End top Fitlers*/
	detectChanges() {
		try {
			this.cdr.detectChanges();
		} catch (e) {

		}
	}
}
