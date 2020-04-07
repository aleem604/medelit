import { Component, OnInit, Inject, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSort, MatPaginator, MatTableDataSource } from '@angular/material';
import { Subscription } from 'rxjs';
import { LayoutUtilsService, MessageType } from '../../../../../../core/_base/crud';
import {
	ServicesService,
	ApiResponse,
    AttachProfessionalToServiceDialogModel,
} from '../../../../../../core/medelit';
import { SelectionModel } from '@angular/cdk/collections';
import { NgxSpinnerService } from 'ngx-spinner';


@Component({
	// tslint:disable-next-line:component-selector
	selector: 'service-professional-connect-dialog',
	templateUrl: './service-professional-connect.dialog.component.html',
	styleUrls: ['./service-professional-connect.dialog.component.scss']
})
export class ServiceProfessionalConnectDialogComponent implements OnInit, OnDestroy {
	@ViewChild(MatSort, { static: true }) sort: MatSort;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	viewLoading = false;

	displayedColumns: string[] = ['select', 'name', 'email', 'telephone', 'city', 'country'];
	dataSource = new MatTableDataSource<AttachProfessionalToServiceDialogModel>();
	selection = new SelectionModel<AttachProfessionalToServiceDialogModel>(true, []);

	private subscriptions: Subscription[] = [];
	constructor(public dialogRef: MatDialogRef<ServiceProfessionalConnectDialogComponent>,
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
		this.servicesService.getProfessionalsWithFeesToConnectWithService(this.data).toPromise().then((resp) => {
			var res = resp as unknown as ApiResponse;
			if (res.success) {
				this.dataSource = new MatTableDataSource<AttachProfessionalToServiceDialogModel>(res.data);
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

	checkboxLabel(row?: AttachProfessionalToServiceDialogModel): string {
		if (!row) {
			return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
		}
		return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
	}

	save() {
		var objs = this.selection.selected.map(m=>m.id);
		this.viewLoading = true;
		this.servicesService.attachProfessionalsToService(objs, this.data).toPromise().then((res) => {
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
