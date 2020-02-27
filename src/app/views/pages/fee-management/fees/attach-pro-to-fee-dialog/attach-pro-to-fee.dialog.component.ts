import { Component, OnInit, Inject, ChangeDetectionStrategy, ViewEncapsulation, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSort, MatPaginator, MatTableDataSource } from '@angular/material';
import { Subscription, Observable } from 'rxjs';
import { LayoutUtilsService, MessageType } from '../../../../../core/_base/crud';
import {
	ApiResponse,
	FilterModel,
	StaticDataService,
	FeesService,
	AttachProToFeeDialogModel,
	selectLastCreatedServiceId
} from '../../../../../core/medelit';
import { SelectionModel } from '@angular/cdk/collections';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormControl } from '@angular/forms';
import { startWith, map, tap } from 'rxjs/operators';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'attach-pro-to-fee-dialog',
	templateUrl: './attach-pro-to-fee.dialog.component.html',
	styleUrls: ['./attach-pro-to-fee.dialog.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AttachProToFeeDialogComponent implements OnInit, OnDestroy {
	proService: AttachProToFeeDialogModel;
	@ViewChild(MatSort, { static: true }) sort: MatSort;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	viewLoading = false;
	hasFormErrors = false;
	feeOption: FormControl = new FormControl("0");

	serviceControl: FormControl = new FormControl();
	servicesForFilter: FilterModel[];
	filteredServices: Observable<FilterModel[]>;

	professionaControl: FormControl = new FormControl();
	professionalsForFitlers: FilterModel[];
	filteredProfessionals: Observable<FilterModel[]>;

	displayedColumns: string[] = ['select', 'pName', 'pCity', 'cService', 'cField', 'cSubcategory'];
	dataSource = new MatTableDataSource<AttachProToFeeDialogModel>();
	selection = new SelectionModel<AttachProToFeeDialogModel>(true, []);
	private subscriptions: Subscription[] = [];

	constructor(public dialogRef: MatDialogRef<AttachProToFeeDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: { feeId: number, feeType: number },
		private feesService: FeesService,
		private spinner: NgxSpinnerService,
		private layoutUtilsService: LayoutUtilsService,
		private staticService: StaticDataService,
		private cdr: ChangeDetectorRef) {
	}

	ngOnInit() {
		this.loadDialogData();
		this.loadServiceForFilter();
	}

	applyFilter(filterValue: string) {
		this.dataSource.filter = filterValue.trim().toLowerCase();
	}

	loadDialogData() {
		this.viewLoading = true;
		this.feesService.getProfessionalToConnectWithFee(this.data.feeId, this.data.feeType).toPromise().then((resp) => {
			var res = resp as unknown as ApiResponse;
			if (res.success) {
				this.dataSource = new MatTableDataSource<AttachProToFeeDialogModel>(res.data);
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

	checkboxLabel(row?: AttachProToFeeDialogModel): string {
		if (!row) {
			return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
		}
		return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
	}

	saveConnections() {
		if (this.feeOption.value === '1') {
			if (!(this.serviceControl.value && this.professionaControl.value)) {
				this.hasFormErrors = true;
				return;
			}
			var serviceId = this.serviceControl.value.id;
			var proId = this.professionaControl.value.id;
			this.feesService.attachNewServiceProfessionalToFee(serviceId, proId, this.data.feeId, this.data.feeType).toPromise().then((res) => {
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

		} else {
			var ids = this.selection.selected.map(x => x.id);
			this.viewLoading = true;
			this.feesService.saveProfessionalToConnectWithFee(ids, this.data.feeId, this.data.feeType).toPromise().then((res) => {
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
	}

	// PT Fees Filter
	loadServiceForFilter() {
		this.feesService.getServicesForFeeForFilter(this.data.feeId, this.data.feeType).subscribe(res => {
			this.servicesForFilter = res.data;

			this.filteredServices = this.serviceControl.valueChanges
				.pipe(
					startWith(''),
					map(value => this._filterPTFees(value))
				);
		});
	}
	private _filterPTFees(value: string): FilterModel[] {
		const filterValue = this._normalizeValue(value);
		return this.servicesForFilter.filter(elem => this._normalizeValue(elem.value).includes(filterValue));
	}

	serviceControlClosed() {
		if (this.serviceControl.value) {
			this.loadProfessionalsForFilter(this.serviceControl.value.id);
		} else {
			this.professionaControl.setValue('');
		}
	}

	/// End PT Fees for filter

	// PRO Fees Filter
	loadProfessionalsForFilter(servieId: number) {
		this.viewLoading = true;
		this.feesService.getProfessionalForFeeForFilter(servieId, this.data.feeId, this.data.feeType).toPromise().then(res => {
			this.professionalsForFitlers = res.data;

			this.filteredProfessionals = this.professionaControl.valueChanges
				.pipe(
					startWith(''),
					map(value => this._filterPROFees(value))
				);
		}).catch(() => {
			this.viewLoading = false;
		}).finally(() => {
			this.viewLoading = false;
		});
	}
	private _filterPROFees(value: string): FilterModel[] {
		const filterValue = this._normalizeValue(value);
		return this.professionalsForFitlers.filter(elem => this._normalizeValue(elem.value).includes(filterValue));
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

	ngOnDestroy(): void {
		this.subscriptions.forEach(el => el.unsubscribe());
	}
	onAlertClose($event) {
		this.hasFormErrors = false;
	}

}
