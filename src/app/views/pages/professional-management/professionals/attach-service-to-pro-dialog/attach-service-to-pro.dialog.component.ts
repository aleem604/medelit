import { Component, OnInit, Inject, ChangeDetectionStrategy, ViewEncapsulation, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSort, MatPaginator, MatTableDataSource } from '@angular/material';
import { Subscription, of, BehaviorSubject, Observable, merge } from 'rxjs';
import { LayoutUtilsService, MessageType } from '../../../../../core/_base/crud';
import {
	ServiceModel,
	ServicesService,
	ApiResponse,
	FilterModel,
	StaticDataService,
    ProfessionalsService
} from '../../../../../core/medelit';
import { SelectionModel } from '@angular/cdk/collections';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormControl } from '@angular/forms';
import { startWith, map } from 'rxjs/operators';


@Component({
	// tslint:disable-next-line:component-selector
	selector: 'attach-service-to-pro-dialog',
	templateUrl: './attach-service-to-pro.dialog.component.html',
	styleUrls: ['./attach-service-to-pro.dialog.component.scss']
})
export class AttachServiceToProDialogComponent implements OnInit, OnDestroy {
	proService: ServiceModel;
	@ViewChild(MatSort, { static: true }) sort: MatSort;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	viewLoading = false;

	displayedColumns: string[] = ['select', 'id', 'name', 'field', 'subCategory', 'tags'];
	dataSource = new MatTableDataSource<ServiceModel>();
	selection = new SelectionModel<ServiceModel>(true, []);

	serviceControl: FormControl = new FormControl();
	servicesForFilter: FilterModel[];
	filteredServices: Observable<FilterModel[]>;

	fieldControl: FormControl = new FormControl();
	fieldsForFilter: FilterModel[];
	filteredFields: Observable<FilterModel[]>;

	subCategoryControl: FormControl = new FormControl();
	subCategoriesForFilter: FilterModel[];
	filteredSubcategories: Observable<FilterModel[]>;
	tagControl: FormControl = new FormControl();

	private subscriptions: Subscription[] = [];
	constructor(public dialogRef: MatDialogRef<AttachServiceToProDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private professionalService: ProfessionalsService,
		private spinner: NgxSpinnerService,
		private layoutUtilsService: LayoutUtilsService,
		private cdr: ChangeDetectorRef) {
		this.tagControl.valueChanges.subscribe((v) => {
			this.serviceControlClosed();
		});


	}

	ngOnInit() {
		this.loadDialogData();
		this.loadServicesDataForFilter();
	}

	loadDialogData() {
		
		this.viewLoading = true;
		this.professionalService.getServicesToConnectWithProfessional(this.data).toPromise().then((resp) => {
			var res = resp as unknown as ApiResponse;
			if (res.success) {
				this.dataSource = new MatTableDataSource<ServiceModel>(res.data);
				this.dataSource.paginator = this.paginator;
				this.dataSource.sort = this.sort;
			}
		}).catch(() => {
			this.viewLoading = false;
		}).finally(() => {
			this.viewLoading = false;
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
		this.professionalService.attachProfessionalToService(ids, this.data).toPromise().then((res) => {
			if (res.success) {
				this.layoutUtilsService.showActionNotification("Changes saved successfully", MessageType.Create);
				this.dialogRef.close(this.selection.selected);
			}
		}).catch(() => {
			this.viewLoading = false;
			this.layoutUtilsService.showActionNotification("An error occured while processing your request", MessageType.Create, 3000);
		}).finally(() => {
			this.viewLoading = false;
		});
	}


	ngOnDestroy(): void {
		this.subscriptions.forEach(el => el.unsubscribe());
	}

	// Filter
	loadServicesDataForFilter() {
		this.professionalService.getServicesForConnectFilter(this.data).subscribe(res => {
			this.servicesForFilter = res.data.services;
			this.fieldsForFilter = res.data.fields;
			this.subCategoriesForFilter = res.data.subCats;

			this.filteredServices = this.serviceControl.valueChanges
				.pipe(
					startWith(''),
					map(value => this._filterServices(value))
			);

			this.filteredFields = this.fieldControl.valueChanges
				.pipe(
					startWith(''),
					map(value => this._filterFields(value))
			);

			this.filteredSubcategories = this.subCategoryControl.valueChanges
				.pipe(
					startWith(''),
					map(value => this._filterSubcats(value))
				);


		});
	}
	private _filterServices(value: string): FilterModel[] {
		const filterValue = this._normalizeValue(value);
		return this.servicesForFilter.filter(elem => this._normalizeValue(elem.value).includes(filterValue));
	}

	private _filterFields(value: string): FilterModel[] {
		const filterValue = this._normalizeValue(value);
		return this.fieldsForFilter.filter(elem => this._normalizeValue(elem.value).includes(filterValue));
	}

	private _filterSubcats(value: string): FilterModel[] {
		const filterValue = this._normalizeValue(value);
		return this.subCategoriesForFilter.filter(elem => this._normalizeValue(elem.value).includes(filterValue));
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

	serviceControlClosed() {
		let filter = '';
		if (this.serviceControl.value) {
			filter += this.serviceControl.value.value;
		}
		if (this.fieldControl.value) {
			filter += ' '+ this.fieldControl.value.value;
		}
		if (this.subCategoryControl.value) {
			filter += ' ' + this.subCategoryControl.value.value;
		}

		if (this.tagControl.value) {
			filter += ' ' + this.tagControl.value;
		}

		this.applyFilter(filter.trim());
	}


	applyFilter(filterValue: string) {
		this.dataSource.filter = filterValue.trim().toLowerCase();

		if (this.dataSource.paginator) {
			this.dataSource.paginator.firstPage();
		}
	}

}
