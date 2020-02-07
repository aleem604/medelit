// Angular
import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
// Material
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSort, MatSnackBar, MatDialog } from '@angular/material';
// RXJS
import { debounceTime, distinctUntilChanged, tap, skip, delay, take } from 'rxjs/operators';
import { fromEvent, merge, Subscription, of } from 'rxjs';
// Translate Module
import { TranslateService } from '@ngx-translate/core';
// NGRX
import { Store, ActionsSubject } from '@ngrx/store';
import { AppState } from '../../../../../core/reducers';
// CRUD
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../../core/_base/crud';
// Services and Models
import { FeeModel, FeesDataSource, FeesPageRequested, OneFeeDeleted, ManyFeesDeleted, FeesStatusUpdated } from '../../../../../core/medelit';
import { SubheaderService } from '../../../../../core/_base/layout';
import { FeeEditDialogComponent } from '../fee-edit-dialog/fee-edit.dialog.component';
import { AttachFeesToProServiceDialogComponent } from '../attach-fees-to-pro-service-dialog/attach-fees-to-pro-service.dialog.component';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-fees-list',
	templateUrl: './fees-list.component.html',
	styleUrls: ['./fees-list.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,

})
export class FeesListComponent implements OnInit, OnDestroy {
	// Table fields
	dataSource: FeesDataSource;
	displayedColumns = ['select', 'feeName', 'feeType', 'tags', 'a1', 'a2', 'actions'];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild('sort1', { static: true }) sort: MatSort;
	// Filter fields
	@ViewChild('searchInput', { static: true }) searchInput: ElementRef;
	feeType = '';
	// Selection
	selection = new SelectionModel<FeeModel>(true, []);
	feesResult: FeeModel[] = [];
	// Subscriptions
	private subscriptions: Subscription[] = [];

	constructor(
		public dialog: MatDialog,
		public snackBar: MatSnackBar,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService,
		private subheaderService: SubheaderService,
		private store: Store<AppState>
	) { }

	ngOnInit() {
		// If the user changes the sort order, reset back to the first page.
		const sortSubscription = this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
		this.subscriptions.push(sortSubscription);

		const paginatorSubscriptions = merge(this.sort.sortChange, this.paginator.page).pipe(
			tap(() => this.loadFeesList())
		)
			.subscribe();
		this.subscriptions.push(paginatorSubscriptions);

		// Filtration, bind to searchInput
		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			// tslint:disable-next-line:max-line-length
			debounceTime(50), // The user can type quite quickly in the input box, and that could trigger a lot of server requests. With this operator, we are limiting the amount of server requests emitted to a maximum of one every 150ms
			distinctUntilChanged(), // This operator will eliminate duplicate values
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadFeesList();
			})
		)
			.subscribe();
		this.subscriptions.push(searchSubscription);

		this.subheaderService.setTitle(this.translate.instant('MEDELIT.FEES.FEES'));

		// Init DataSource
		this.dataSource = new FeesDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.feesResult = res;
		});
		this.subscriptions.push(entitiesSubscription);
		// First load
		of(undefined).pipe(take(1), delay(1000)).subscribe(() => { // Remove this line, just loading imitation
			this.loadFeesList();
		}); // Remove this line, just loading imitation
	}

	ngOnDestroy() {
		this.subscriptions.forEach(el => el.unsubscribe());
	}

	loadFeesList() {
		this.selection.clear();
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex,
			this.paginator.pageSize
		);
		// Call request from server
		this.store.dispatch(new FeesPageRequested({ page: queryParams }));
		this.selection.clear();
	}

	filterConfiguration(): any {
		const filter: any = {};
		try {
			const searchText = this.searchInput.nativeElement.value;
			const feeType = this.feeType;

			if (feeType) {
				filter.feeType = feeType;
			}

			if (searchText)
				filter.search = searchText;
		} catch{

		}
		return filter;
	}

	deleteFee(_item: FeeModel) {
		const _title: string = this.translate.instant('MEDELIT.FEES.DELETE_FEE_SIMPLE.TITLE');
		const _description: string = this.translate.instant('MEDELIT.FEES.DELETE_FEE_SIMPLE.DESCRIPTION');
		const _waitDesciption: string = this.translate.instant('MEDELIT.FEES.DELETE_FEE_SIMPLE.WAIT_DESCRIPTION');
		const _deleteMessage = this.translate.instant('MEDELIT.FEES.DELETE_FEE_SIMPLE.MESSAGE');

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.store.dispatch(new OneFeeDeleted({ id: _item.id, feeTypeId: _item.feeTypeId }));
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
			setTimeout(() => this.loadFeesList(), 2000);
		});
	}

	deleteFees() {
		const _title: string = this.translate.instant('MEDELIT.FEES.DELETE_FEE_MULTY.TITLE');
		const _description: string = this.translate.instant('MEDELIT.FEES.DELETE_FEE_MULTY.DESCRIPTION');
		const _waitDesciption: string = this.translate.instant('MEDELIT.FEES.DELETE_FEE_MULTY.WAIT_DESCRIPTION');
		const _deleteMessage = this.translate.instant('MEDELIT.FEES.DELETE_FEE_MULTY.MESSAGE');

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			const idsForDeletion: FeeModel[] = [];
			for (let i = 0; i < this.selection.selected.length; i++) {
				idsForDeletion.push(this.selection.selected[i]);
			}
			this.store.dispatch(new ManyFeesDeleted({ ids: idsForDeletion }));
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
			setTimeout(() => this.loadFeesList(), 2000);
			this.selection.clear();
		});
	}

	fetchFees() {
		const messages = [];
		this.selection.selected.forEach(elem => {
			messages.push({
				text: `${elem.feeCode}, ${elem.feeName}`,
				id: elem.id.toString(),
				status: elem.status
			});
		});
		this.layoutUtilsService.fetchElements(messages);
	}

	connectFees() {

		const dialogRef = this.dialog.open(AttachFeesToProServiceDialogComponent, { data: this.selection.selected });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			//this.spinner.show();
			this.loadFeesList();
			this.layoutUtilsService.showActionNotification("Changes saved successfully", MessageType.Create);
		});


	}




	updateStatusForFees() {
		const _title = this.translate.instant('MEDELIT.FEES.UPDATE_STATUS.TITLE');
		const _updateMessage = this.translate.instant('MEDELIT.FEES.UPDATE_STATUS.MESSAGE');
		const _statuses = [{ value: 0, text: 'Suspended' }, { value: 1, text: 'Active' }, { value: 2, text: 'Pending' }];
		const _messages = [];

		this.selection.selected.forEach(elem => {
			_messages.push({
				text: `${elem.feeCode}, ${elem.feeName}`,
				id: elem.id.toString(),
				feeTypeId: elem.feeTypeId,
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

			this.store.dispatch(new FeesStatusUpdated({
				status: +res,
				fees: this.selection.selected
			}));

			this.layoutUtilsService.showActionNotification(_updateMessage, MessageType.Update, 10000, true, true);
			this.selection.clear();
		});
	}

	addFee() {
		const newFee = new FeeModel();
		newFee.clear(); // Set all defaults fields
		this.editFee(newFee);
	}

	editFee(fee: FeeModel) {
		let saveMessageTranslateParam = 'MEDELIT.FEES.EDIT.';
		saveMessageTranslateParam += fee.id > 0 ? 'UPDATE_MESSAGE' : 'ADD_MESSAGE';
		const _saveMessage = this.translate.instant(saveMessageTranslateParam);
		const _messageType = fee.id > 0 ? MessageType.Update : MessageType.Create;
		const dialogRef = this.dialog.open(FeeEditDialogComponent, { data: { fee } });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.layoutUtilsService.showActionNotification(_saveMessage, _messageType);
			this.loadFeesList();
		});
	}

	isAllSelected(): boolean {
		const numSelected = this.selection.selected.length;
		const numRows = this.feesResult.length;
		return numSelected === numRows;
	}

	masterToggle() {
		if (this.selection.selected.length === this.feesResult.length) {
			this.selection.clear();
		} else {
			this.feesResult.forEach(row => this.selection.select(row));
		}
	}

	getItemCssClassByStatus(status: number = 0): string {
		switch (status) {
			case 0:
				return 'danger';
			case 1:
				return 'success';
			case 2:
				return 'metal';
		}
		return '';
	}

	getItemStatusString(status: number = 0): string {
		switch (status) {
			case 0:
				return 'Suspended';
			case 1:
				return 'Active';
			case 2:
				return 'Pending';
		}
		return '';
	}

}
