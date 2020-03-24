import { Component, OnInit, Inject, ChangeDetectionStrategy, ViewEncapsulation, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSort, MatPaginator, MatTableDataSource } from '@angular/material';
import { Subscription, of, BehaviorSubject, Observable, merge } from 'rxjs';
import { LayoutUtilsService, MessageType } from '../../../../../core/_base/crud';
import {
	ApiResponse,
	FilterModel,
	StaticDataService,
	FeesService,
	AttachServiceToFeeDialogModel,
    eFeeType
} from '../../../../../core/medelit';
import { SelectionModel } from '@angular/cdk/collections';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormControl } from '@angular/forms';
import { startWith, map, tap } from 'rxjs/operators';
import { AttachServiceToProDialogComponent } from '../../../professional-management/professionals/attach-service-to-pro-dialog/attach-service-to-pro.dialog.component';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'attach-service-to-fee-dialog',
	templateUrl: './attach-service-to-fee.dialog.component.html',
	styleUrls: ['./attach-service-to-fee.dialog.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AttachServiceToFeeDialogComponent implements OnInit, OnDestroy {
	proService: AttachServiceToFeeDialogModel;
	@ViewChild(MatSort, { static: true }) sort: MatSort;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	viewLoading = false;


	fieldControl: FormControl = new FormControl();
	fieldsForFilter: FilterModel[];
	filteredFields: Observable<FilterModel[]>;

	categoryControl: FormControl = new FormControl();
	categoriesForFitlers: FilterModel[];
	filteredCategories: Observable<FilterModel[]>;
	tagControl: FormControl = new FormControl();

	displayedColumns: string[] = ['select', 'id', 'serviceName', 'cField', 'cSubcategory'];
	dataSource = new MatTableDataSource<AttachServiceToFeeDialogModel>();
	selection = new SelectionModel<AttachServiceToFeeDialogModel>(true, []);
	private subscriptions: Subscription[] = [];

	constructor(public dialogRef: MatDialogRef<AttachServiceToProDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: {feeId: number, feeType: eFeeType},
		private feesService: FeesService,
		private spinner: NgxSpinnerService,
		private layoutUtilsService: LayoutUtilsService,
		private staticService: StaticDataService,
		private cdr: ChangeDetectorRef) {
	}

	ngOnInit() {
		this.loadCategoriesForFilter();
		this.loadFieldsForFilter();
		this.loadDialogData();
	}

	loadDialogData() {

		this.viewLoading = true;
		this.feesService.getServicesToConnectWithFee(this.data.feeId, this.data.feeType).toPromise().then((resp) => {
			var res = resp as unknown as ApiResponse;
			if (res.success) {
				this.dataSource = new MatTableDataSource<AttachServiceToFeeDialogModel>(res.data);
				this.dataSource.paginator = this.paginator;
				this.dataSource.sort = this.sort;
			}
		}).catch(() => {
			this.viewLoading = false;
		}).finally(() => {
			this.viewLoading = false;
			this.cdr.detectChanges();
		});
	}

	isAllSelected() {
		const numSelected = this.selection.selected.length;
		const numRows = this.dataSource.data.length;
		return numSelected === numRows;
	}

	masterToggle() {
		this.isAllSelected() ?
			this.selection.clear() :
			this.dataSource.data.forEach(row => this.selection.select(row));
	}

	checkboxLabel(row?: AttachServiceToFeeDialogModel): string {
		if (!row) {
			return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
		}
		return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
	}

	saveConnections() {
		var ids = this.selection.selected.map(x => x.id);
		this.viewLoading = true;
		this.feesService.saveServicesToConnectWithFee(ids, this.data.feeId, this.data.feeType).toPromise().then((res) => {
			if (res.success) {
				this.layoutUtilsService.showActionNotification("Changes saved successfully", MessageType.Create);
				this.dialogRef.close(this.selection.selected);
			}
		}).catch(() => {
			this.viewLoading = false;
			this.layoutUtilsService.showActionNotification("An error occured while processing your request", MessageType.Create, 3000);
		}).finally(() => {
			this.viewLoading = false;
			this.cdr.detectChanges();
		});
	}


	ngOnDestroy(): void {
		this.subscriptions.forEach(el => el.unsubscribe());
	}

	// fields
	loadFieldsForFilter() {
		this.staticService.getFieldsForFilter().subscribe(res => {
			this.fieldsForFilter = res.data;

			this.filteredFields = this.fieldControl.valueChanges
				.pipe(
					startWith(''),
					map(value => this._filterFields(value))
				);
		});

	}
	private _filterFields(value: string): FilterModel[] {
		const filterValue = this._normalizeValue(value);
		return this.fieldsForFilter.filter(title => this._normalizeValue(title.value).includes(filterValue));
	}
	// end account code id filter

	// countries
	loadCategoriesForFilter() {
		let fields = this.fieldControl.value;

		this.staticService.getCategoriesForFilter(fields).subscribe(res => {
			this.categoriesForFitlers = res.data;

			this.filteredCategories = this.categoryControl.valueChanges
				.pipe(
					startWith(''),
					map(value => this._filterCategories(value))
				);
		});

	}
	private _filterCategories(value: string): FilterModel[] {
		const filterValue = this._normalizeValue(value);
		return this.categoriesForFitlers.filter(title => this._normalizeValue(title.value).includes(filterValue));
	}
	// end account code id filter

	displayFn(option: FilterModel): string {
		if (option)
			return option.value;
		return '';
	}

	private _normalizeValue(value: string): string {
		if (value && value.length > 0)
			return value.toLowerCase().replace(/\s/g, '');
		return value;
	}

	// End Fitler Section

}
