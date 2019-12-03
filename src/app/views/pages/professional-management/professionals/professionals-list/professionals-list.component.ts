// Angular
import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// Material
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
// RXJS
import { debounceTime, distinctUntilChanged, tap, skip, delay, startWith, map } from 'rxjs/operators';
import { fromEvent, merge, Observable, of, Subscription } from 'rxjs';
// NGRX
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../../core/reducers';
// UI
import { SubheaderService } from '../../../../../core/_base/layout';
// CRUD
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../../core/_base/crud';
// Services and Models
import {
	ProfessionalModel,
	ProfessionalDataSource,
	ProfessionalsPageRequested,
	OneProfessionalDeleted,
	ManyProfessionalsDeleted,
	ProfessionalsStatusUpdated,
	selectProfessionalsPageLastQuery,
	FilterModel
} from '../../../../../core/medelit';
import { FormControl } from '@angular/forms';
import { StaticDataService } from '../../../../../core/medelit/_services';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-professionals-list',
	templateUrl: './professionals-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfessionalsListComponent implements OnInit, OnDestroy {
	// Table fields
	dataSource: ProfessionalDataSource;
	displayedColumns = ['select', 'id', 'name', 'mobilePhone', 'email', 'fields', 'subCategories', 'languages', 'status', 'actions'];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild('sort1', { static: true }) sort: MatSort;
	// Filter fields
	@ViewChild('searchInput', { static: true }) searchInput: ElementRef;
	statusesForFilter: FilterModel[] = [];
	statusControl = new FormControl({ id: -1 }, []);
	filteredStatuses: Observable<FilterModel[]>;

	lastQuery: QueryParamsModel;
	// Selection
	selection = new SelectionModel<ProfessionalModel>(true, []);
	professionalsResult: ProfessionalModel[] = [];
	private subscriptions: Subscription[] = [];


	constructor(public dialog: MatDialog,
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private staticService: StaticDataService,
		private cdr: ChangeDetectorRef,
		private store: Store<AppState>) { }


	ngOnInit() {
		this.loadStatusesForFilter();
		// If the user changes the sort order, reset back to the first page.
		const sortSubscription = this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
		this.subscriptions.push(sortSubscription);

		const paginatorSubscriptions = merge(this.sort.sortChange, this.paginator.page).pipe(
			tap(() => this.loadProfessionalsList())
		)
			.subscribe();
		this.subscriptions.push(paginatorSubscriptions);

		// Filtration, bind to searchInput
		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			debounceTime(150),
			distinctUntilChanged(),
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadProfessionalsList();
			})
		)
			.subscribe();
		this.subscriptions.push(searchSubscription);

		// Set title to page breadCrumbs
		this.subheaderService.setTitle('Leads');

		// Init DataSource
		this.dataSource = new ProfessionalDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.professionalsResult = res;
		});
		this.subscriptions.push(entitiesSubscription);
		const lastQuerySubscription = this.store.pipe(select(selectProfessionalsPageLastQuery)).subscribe(res => this.lastQuery = res);
		// Load last query from store
		this.subscriptions.push(lastQuerySubscription);

		// Read from URL itemId, for restore previous state
		const routeSubscription = this.activatedRoute.queryParams.subscribe(params => {
			if (params.id) {
				this.restoreState(this.lastQuery, +params.id);
			}

			// First load
			of(undefined).pipe(delay(1000)).subscribe(() => { // Remove this line, just loading imitation
				this.loadProfessionalsList();
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
	 * Load Professionals List
	 */
	loadProfessionalsList() {
		this.selection.clear();
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex,
			this.paginator.pageSize
		);
		// Call request from server
		this.store.dispatch(new ProfessionalsPageRequested({ page: queryParams }));
		this.selection.clear();
	}

	/**
	 * Returns object for filter
	 */
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


	deleteProfessional(_item: ProfessionalModel) {
		const _title = 'Professional Delete';
		const _description = 'Are you sure to permanently delete this professional?';
		const _waitDesciption = 'Professional is deleting...';
		const _deleteMessage = `Professional has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.store.dispatch(new OneProfessionalDeleted({ id: _item.id }));
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
		});
	}

	/**
	 * Delete professionals
	 */
	deleteProfessionals() {
		const _title = 'Professionals Delete';
		const _description = 'Are you sure to permanently delete selected professionals?';
		const _waitDesciption = 'Professionals are deleting...';
		const _deleteMessage = 'Selected professionals have been deleted';

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
			this.store.dispatch(new ManyProfessionalsDeleted({ ids: idsForDeletion }));
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
			this.selection.clear();
		});
	}

	/**
	 * Fetch selected professionals
	 */
	fetchProfessionals() {
		// tslint:disable-next-line:prefer-const
		let messages = [];
		this.selection.selected.forEach(elem => {
			messages.push({
				text: `${elem.code} ${elem.name} ${elem.email}`,
				id: elem.id,
				status: elem.status
			});
		});
		this.layoutUtilsService.fetchElements(messages);
	}

	/**
	 * Update status dialog
	 */
	updateStatusForProfessionals() {
		const _title = 'Update status for selected professionals';
		const _updateMessage = 'Status has been updated for selected professionals';
		const _statuses = [{ value: 0, text: 'Selling' }, { value: 1, text: 'Sold' }];
		const _messages = [];

		this.selection.selected.forEach(elem => {
			_messages.push({
				text: `${elem.code} ${elem.name} ${elem.email}`,
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

			this.store.dispatch(new ProfessionalsStatusUpdated({
				status: +res,
				professionals: this.selection.selected
			}));

			this.layoutUtilsService.showActionNotification(_updateMessage, MessageType.Update);
			this.selection.clear();
		});
	}

	/**
	 * Redirect to edit page
	 *
	 * @param id: any
	 */
	editProfessional(id) {
		this.router.navigate(['../professionals/edit', id], { relativeTo: this.activatedRoute });
	}

	createProfessional() {
		this.router.navigateByUrl('/professional-management/professionals/add');
	}

	restoreState(queryParams: QueryParamsModel, id: number) {

		if (!queryParams.filter) {
			return;
		}

		if ('status' in queryParams.filter) {
			this.statusControl = queryParams.filter.status.toString();
		}

		if (queryParams.filter.model) {
			this.searchInput.nativeElement.value = queryParams.filter.model;
		}
	}
	/**
	 * Check all rows are selected
	 */
	isAllSelected() {
		const numSelected = this.selection.selected.length;
		const numRows = this.professionalsResult.length;
		return numSelected === numRows;
	}

	/**
	 * Selects all rows if they are not all selected; otherwise clear selection
	 */
	masterToggle() {
		if (this.isAllSelected()) {
			this.selection.clear();
		} else {
			this.professionalsResult.forEach(row => this.selection.select(row));
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
		this.staticService.getStatuses().subscribe(res => {
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
		return this.statusesForFilter.filter(status => this._normalizeValue(status.name).includes(filterValue));
	}


	private _normalizeValue(value: string): string {
		if (value && value.length > 0)
			return value.toLowerCase().replace(/\s/g, '');
		return value;
	}

	displayFn(option: FilterModel): string {
		if (option)
			return option.name;
		return '';
	}

	statusDrpClosed() {
		this.loadProfessionalsList();
	}


	/*End top Fitlers*/

	detectChanges() {
		try {
			this.cdr.detectChanges();
		} catch (e) {

		}
	}
}