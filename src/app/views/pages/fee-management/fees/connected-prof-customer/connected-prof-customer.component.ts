import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Input, ViewChild } from '@angular/core';

import { MatDialog, MatTableDataSource, MatSort, MatPaginator } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { ApiResponse, FeesService, ConnectedProfessionalsCustomersModel } from '../../../../../core/medelit';
import { NgxSpinnerService } from 'ngx-spinner';
import { LayoutUtilsService, MessageType } from '../../../../../core/_base/crud';
import { AttachServiceToFeeDialogComponent } from '../attach-service-to-fee-dialog/attach-service-to-fee.dialog.component';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'connected-prof-customer',
	templateUrl: './connected-prof-customer.component.html',
	styleUrls: ['./connected-prof-customer.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConnectedProfCustomerComponent implements OnInit, OnDestroy {
	@Input("feeId") feeId;
	@ViewChild(MatSort, { static: true }) sort: MatSort;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;


	displayedColumns: string[] = ['proName', 'sName', 'feeType', 'feeA1', 'feeA2'];
	dataSource = new MatTableDataSource<ConnectedProfessionalsCustomersModel>();
	selection = new SelectionModel<ConnectedProfessionalsCustomersModel>(true, []);
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

	loadGridData() {
		this.spinner.show();
		this.feeService.getConnectProfessionalsCustomers(this.feeId).toPromise().then((resp) => {
			var res = resp as unknown as ApiResponse;
			if (res.success) {
				this.dataSource = new MatTableDataSource<ConnectedProfessionalsCustomersModel>(res.data);
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
		const dialogRef = this.dialog.open(AttachServiceToFeeDialogComponent, { data: this.feeId });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			//this.spinner.show();
			this.loadGridData();
			this.layoutUtilsService.showActionNotification("Changes saved successfully", MessageType.Create);
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
