import { Component, OnInit, Inject, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSort, MatPaginator, MatTableDataSource } from '@angular/material';
import { Subscription } from 'rxjs';
import { LayoutUtilsService, MessageType } from '../../../../../../core/_base/crud';
import {
	ServiceModel,
	ServicesService,
	ApiResponse,
	ServiceConnectedPtFeeDialogModel,
} from '../../../../../../core/medelit';
import { SelectionModel } from '@angular/cdk/collections';
import { NgxSpinnerService } from 'ngx-spinner';


@Component({
	// tslint:disable-next-line:component-selector
	selector: 'service-connected-pt-fee-dialog',
	templateUrl: './service-connected-pt-fee.dialog.component.html',
	styleUrls: ['./service-connected-pt-fee.dialog.component.scss']
})
export class ServiceConnectedPtFeeDialogComponent implements OnInit, OnDestroy {
	@ViewChild(MatSort, { static: true }) sort: MatSort;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	viewLoading = false;

	displayedColumns: string[] = ['select', 'ptFeeName', 'ptFeeA1', 'ptFeeA2', 'professionals', 'services', 'tags'];
	dataSource = new MatTableDataSource<ServiceConnectedPtFeeDialogModel>();
	selection = new SelectionModel<ServiceConnectedPtFeeDialogModel>(true, []);

	private subscriptions: Subscription[] = [];
	constructor(public dialogRef: MatDialogRef<ServiceConnectedPtFeeDialogComponent>,
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
		this.servicesService.getServiceConnectedPtFeesToAttach(this.data).toPromise().then((resp) => {
			var res = resp as unknown as ApiResponse;
			if (res.success) {
				this.dataSource = new MatTableDataSource<ServiceConnectedPtFeeDialogModel>(res.data);
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

	checkboxLabel(row?: ServiceConnectedPtFeeDialogModel): string {
		if (!row) {
			return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
		}
		return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.ptFeeId + 1}`;
	}

	save() {
		var objs = this.selection.selected;
		this.viewLoading = true;
		this.servicesService.saveServiceConnectedPtFeesToAttach(this.data, objs).toPromise().then((res) => {
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
