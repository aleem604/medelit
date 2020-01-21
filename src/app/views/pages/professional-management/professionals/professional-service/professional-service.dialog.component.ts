import { Component, OnInit, Inject, ChangeDetectionStrategy, ViewEncapsulation, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSort, MatPaginator, MatTableDataSource } from '@angular/material';
import { Subscription, of, BehaviorSubject, Observable, merge } from 'rxjs';
import { LayoutUtilsService, MessageType } from '../../../../../core/_base/crud';
import {
	ServiceModel,
	ServicesService,
	ApiResponse,
	FilterModel,
	StaticDataService
} from '../../../../../core/medelit';
import { SelectionModel } from '@angular/cdk/collections';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormControl } from '@angular/forms';
import { startWith, map, tap } from 'rxjs/operators';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-professional-service-dialog',
	templateUrl: './professional-service.dialog.component.html',
	styleUrls: ['./professional-service.dialog.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class ProfessionalServiceDialogComponent implements OnInit, OnDestroy {
	proService: ServiceModel;
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

	displayedColumns: string[] = ['select', 'id', 'name', 'ptFeeA1', 'ptFeeA2', 'proFeeA1', 'proFeeA2'];
	dataSource = new MatTableDataSource<ServiceModel>();
	selection = new SelectionModel<ServiceModel>(true, []);
	private subscriptions: Subscription[] = [];

	constructor(public dialogRef: MatDialogRef<ProfessionalServiceDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private servicesService: ServicesService,
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
		let field = null;
		let category = null;
		if (this.fieldControl.value) 
			field = this.fieldControl.value.id;
		if (this.categoryControl.value)
			category = this.categoryControl.value.id;
		
		this.viewLoading = true;
		this.servicesService.getProfessionalServices(this.data, field, category, this.tagControl.value).toPromise().then((resp) => {
			var res = resp as unknown as ApiResponse;
			if (res.success) {
				this.dataSource = new MatTableDataSource<ServiceModel>(res.data.services);
				this.dataSource.paginator = this.paginator;
				this.dataSource.sort = this.sort;
				if (res.data.serviceIds.length > 0) {
					var selected = res.data.serviceIds as unknown as number[];
					this.dataSource.data.forEach((row) => {
						if (selected.indexOf(row.id) > -1)
							this.selection.select(row);
					});
				}
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

	checkboxLabel(row?: ServiceModel): string {
		if (!row) {
			return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
		}
		return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
	}

	save() {
		var ids = this.selection.selected.map(x => x.id);
		this.viewLoading = true;
		this.servicesService.addProfessionalToServices(ids, this.data).toPromise().then((res) => {
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

	updateEntities() {
		if (this.selection.selected.length == 0) return;
		this.spinner.show();
		this.servicesService.addProfessionalToServices(this.selection.selected, this.data).subscribe((res) => {

			var r = res as unknown as ApiResponse;
			if (r.success) {
				const message = `Featured Events updated successfully`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 10000, true, true);
			}
		});
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
		this.staticService.getCategoriesForFilter().subscribe(res => {
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
