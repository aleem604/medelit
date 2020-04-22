import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Input, ViewChild } from '@angular/core';
import { MatDialog, MatTableDataSource, MatSort, MatPaginator } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { Observable, of, BehaviorSubject } from 'rxjs';
import * as _ from 'lodash';
import { ApiResponse, ProfessionalConnectedServicesModel, ProfessionalsService } from '../../../../../core/medelit';
import { NgxSpinnerService } from 'ngx-spinner';
import { LayoutUtilsService, MessageType } from '../../../../../core/_base/crud';
import { ConfirmDialogComponent } from '../../../../partials/confirm-dialog/confirm-dialog.component';
import { AttachServiceToProDialogComponent } from '../../professionals/attach-service-to-pro-dialog/attach-service-to-pro.dialog.component';
import { AddFeeToServiceDialogComponent } from '../../professionals/add-fee-to-service-dialog/add-fee-to-service.dialog.component';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'professional-connected-services',
	templateUrl: './professional-connected-services.component.html',
	styleUrls: ['./professional-connected-services.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfessionalConnectedServicesComponent implements OnInit, OnDestroy {
	@Input("proId") proId;
	@ViewChild(MatSort, { static: true }) sort: MatSort;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

	displayedColumns: string[] = ['select', 'cService', 'cField', 'cSubcategory', 'ptFeeA1', 'ptFeeA2', 'proFeeA1', 'proFeeA2', 'actions'];
	dataSource = new MatTableDataSource<ProfessionalConnectedServicesModel>();
	selection = new SelectionModel<ProfessionalConnectedServicesModel>(true, []);
	loadingSubject = new BehaviorSubject<boolean>(true);
	loading$: Observable<boolean>;

	constructor(
		private spinner: NgxSpinnerService,
		public dialog: MatDialog,
		private professionalService: ProfessionalsService,
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
		this.professionalService.getProfessionalConnectedServices(this.proId).toPromise().then((resp) => {
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
		const dialogRef = this.dialog.open(AttachServiceToProDialogComponent, { data: this.proId });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			//this.spinner.show();
			this.loadGridData();
			this.layoutUtilsService.showActionNotification("Changes saved successfully", MessageType.Create);
		});
	}

	detachServices() {
		const _title = 'Connected service delete';
		const _description = 'Are you sure to permanently delete the services connections?';
		const _waitDesciption = 'Deleting...';
		const _deleteMessage = `Record(s) has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			var serviceObjs = this.selection.selected;
			this.spinner.show();
			this.professionalService.detachProfessionalConnectedServices(serviceObjs, this.proId).toPromise()
				.then((res) => {
					this.loadGridData();
					this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
				}).catch((e) => {
					this.spinner.hide();
				}).finally(() => {
					this.spinner.hide();
				});
		});
	}

	addService() {
		const dialogRef = this.dialog.open(AttachServiceToProDialogComponent, { data: this.proId });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			this.loadGridData();
			this.layoutUtilsService.showActionNotification("Changes saved successfully", MessageType.Create);
		});
	}


	removeService(service: ProfessionalConnectedServicesModel) {
		const dialogRef = this.dialog.open(ConfirmDialogComponent, {
			width: '250px',
			data: { title: 'Professional detach', message: 'Are you sure to detach professional from this service?' }
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				this.spinner.show();
				this.professionalService.detachProfessionalConnectedServices([service], this.proId).toPromise().then((res) => {
					if (res.success) {
						this.loadGridData();
						this.layoutUtilsService.showActionNotification("Request processed successfully", MessageType.Delete, 3000);
					} else {
						if (res.errors)
							this.layoutUtilsService.showActionNotification(_.join(res.errors, "<br/>"), MessageType.Delete, 3000);
					}
				}).catch((err) => {
					this.spinner.hide();
					this.layoutUtilsService.showActionNotification("An error occured while porcessing your request. Please try again later.", MessageType.Update, 3000);
				}).finally(() => {
					this.spinner.hide();
				});
			}
		});
	}

	editServiceFee(serviceRow: ProfessionalConnectedServicesModel) {
		const dialogRef = this.dialog.open(AddFeeToServiceDialogComponent, { data: serviceRow });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			this.loadGridData();

			this.layoutUtilsService.showActionNotification("Changes saved successfully", MessageType.Create);
			this.detectChanges();
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
