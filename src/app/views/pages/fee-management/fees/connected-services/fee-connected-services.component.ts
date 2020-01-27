import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Input, ViewChild } from '@angular/core';

import { MatDialog, MatTableDataSource, MatSort, MatPaginator } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { ApiResponse, FeesService, ProfessionalConnectedServicesModel } from '../../../../../core/medelit';
import { NgxSpinnerService } from 'ngx-spinner';
import { LayoutUtilsService, MessageType } from '../../../../../core/_base/crud';
import { AttachProToFeeDialogComponent } from '../attach-pro-to-fee-dialog/attach-pro-to-fee.dialog.component';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'fee-connected-services',
	templateUrl: './fee-connected-services.component.html',
	styleUrls: ['./fee-connected-services.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeeConnectedServicesComponent implements OnInit, OnDestroy {
	@Input("feeId") feeId;
	@Input("feeType") feeType;
	@ViewChild(MatSort, { static: true }) sort: MatSort;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

	displayedColumns: string[] = ['select', 'cService', 'cField', 'cSubcategory'];
	dataSource = new MatTableDataSource<ProfessionalConnectedServicesModel>();
	selection = new SelectionModel<ProfessionalConnectedServicesModel>(true, []);
	loadingSubject = new BehaviorSubject<boolean>(true);
	loading$: Observable<boolean>;

	constructor(
		private spinner: NgxSpinnerService,
		public dialog: MatDialog,
		private feeService: FeesService,
		private layoutUtilsService: LayoutUtilsService,
		private cdr: ChangeDetectorRef) {
	}

	ngOnInit(): void {
		this.loadGridData();
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

	checkboxLabel(row?: ProfessionalConnectedServicesModel): string {
		if (!row) {
			return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
		}
		return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
	}

	loadGridData() {
		this.selection = new SelectionModel<ProfessionalConnectedServicesModel>(true, []);

		this.spinner.show();
		this.feeService.getFeeConnectedServices(this.feeId, this.feeType).toPromise().then((resp) => {
			var res = resp as unknown as ApiResponse;
			if (res.success) {
				this.dataSource = new MatTableDataSource<ProfessionalConnectedServicesModel>(res.data);
				this.dataSource.paginator = this.paginator;
				this.dataSource.sort = this.sort;
				this.detectChanges();
			}
		}).catch((e) => this.spinner.hide())
			.finally(() => {
				this.spinner.hide();
			});
	}

	connectService() {
		const dialogRef = this.dialog.open(AttachProToFeeDialogComponent, { data: this.feeId });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			//this.spinner.show();
			this.loadGridData();
			this.layoutUtilsService.showActionNotification("Changes saved successfully", MessageType.Create);
		});
	}

	deleteConnects() {
		const _title = 'Connected service delete';
		const _description = 'Are you sure to permanently delete the services connections?';
		const _waitDesciption = 'Deleting...';
		const _deleteMessage = `Record(s) has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			var posIds = this.selection.selected.map((e) => e.id);
			this.spinner.show();
			//this.feeService.deleteConnectedProfessionals(posIds, this.feeId).toPromise()
			//	.then((res) => {
			//		this.loadGridData();
			//		this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
			//	}).catch((e) => {
			//		this.spinner.hide();
			//	}).finally(() => {
			//		this.spinner.hide();
			//	});
		});
	}

	ngOnDestroy(): void {

	}
	detectChanges() {
		try {
			this.cdr.detectChanges();
		} catch (e) {
			console.log(e);
		}
	}

}
