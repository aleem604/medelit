import { Component, OnInit, Inject, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSort, MatPaginator, MatTableDataSource } from '@angular/material';
import { Subscription } from 'rxjs';
import { LayoutUtilsService, MessageType } from '../../../../../../core/_base/crud';
import {
	ServicesService,
	ApiResponse,
	ServiceConnectedProFeeDialogModel,
} from '../../../../../../core/medelit';
import { SelectionModel } from '@angular/cdk/collections';
import { NgxSpinnerService } from 'ngx-spinner';


@Component({
	// tslint:disable-next-line:component-selector
	selector: 'service-connected-pro-fee-dialog',
	templateUrl: './service-connected-pro-fee.dialog.component.html',
	styleUrls: ['./service-connected-pro-fee.dialog.component.scss']
})
export class ServiceConnectedProFeeDialogComponent implements OnInit, OnDestroy {
	@ViewChild(MatSort, { static: true }) sort: MatSort;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	viewLoading = false;

	displayedColumns: string[] = ['select', 'proFeeName', 'proFeeA1', 'proFeeA2', 'professionals', 'services', 'tags'];
	dataSource = new MatTableDataSource<ServiceConnectedProFeeDialogModel>();
	selection = new SelectionModel<ServiceConnectedProFeeDialogModel>(true, []);

	private subscriptions: Subscription[] = [];
	constructor(public dialogRef: MatDialogRef<ServiceConnectedProFeeDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: number,
		private servicesService: ServicesService,
		private spinner: NgxSpinnerService,
		private layoutUtilsService: LayoutUtilsService,
		private cdr: ChangeDetectorRef) {
		
	}

	ngOnInit() {
		this.loadDialogData();
	}

	loadDialogData() {
		
		this.viewLoading = true;
		this.servicesService.getServiceConnectedProFeesToAttach(this.data).toPromise().then((resp) => {
			var res = resp as unknown as ApiResponse;
			if (res.success) {
				this.dataSource = new MatTableDataSource<ServiceConnectedProFeeDialogModel>(res.data);
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

	checkboxLabel(row?: ServiceConnectedProFeeDialogModel): string {
		if (!row) {
			return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
		}
		return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.proFeeId + 1}`;
	}

	save() {
		var objs = this.selection.selected.map(m=>m.proFeeId);
		this.viewLoading = true;
		this.servicesService.saveServiceConnectedProFeesToAttach(this.data, objs).toPromise().then((res) => {
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

	
	applyFilter(filterValue: string) {
		this.dataSource.filter = filterValue.trim().toLowerCase();

		if (this.dataSource.paginator) {
			this.dataSource.paginator.firstPage();
		}
	}

}
