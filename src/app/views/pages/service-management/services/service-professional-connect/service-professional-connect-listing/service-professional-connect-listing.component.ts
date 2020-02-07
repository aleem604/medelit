import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Input, ViewChild, EventEmitter, Output } from '@angular/core';
import { MatDialog, MatTableDataSource, MatSort, MatPaginator } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { Observable, of, BehaviorSubject, Subject } from 'rxjs';
import * as _ from 'lodash';
import { ApiResponse, ProfessionalConnectedServicesModel, ServicesService } from '../../../../../../core/medelit';
import { NgxSpinnerService } from 'ngx-spinner';
import { LayoutUtilsService, MessageType } from '../../../../../../core/_base/crud';
import { ConfirmDialogComponent } from '../../../../../partials/confirm-dialog/confirm-dialog.component';
import { ServiceProfessionalConnectDialogComponent } from '../service-professional-connect-dialog/service-professional-connect.dialog.component';


@Component({
	// tslint:disable-next-line:component-selector
	selector: 'service-professional-connect-listing',
	templateUrl: './service-professional-connect-listing.component.html',
	styleUrls: ['./service-professional-connect-listing.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfessionalToServiceListingComponent implements OnInit, OnDestroy {
	@Input("serviceId") serviceId;
	@Output('reloadData') reloadData = new EventEmitter();
	@Input() changing: Subject<boolean>;
	@ViewChild(MatSort, { static: true }) sort: MatSort;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

	displayedColumns: string[] = ['select', 'professional', 'ptFeeName', 'ptFeeA1', 'ptFeeA2', 'proFeeName', 'proFeeA1', 'proFeeA2'];
	dataSource = new MatTableDataSource<ProfessionalConnectedServicesModel>();
	selection = new SelectionModel<ProfessionalConnectedServicesModel>(true, []);
	loadingSubject = new BehaviorSubject<boolean>(true);
	loading$: Observable<boolean>;

	constructor(
		private spinner: NgxSpinnerService,
		public dialog: MatDialog,
		private servicesService: ServicesService,
		private layoutUtilsService: LayoutUtilsService,
		private cdr: ChangeDetectorRef) {
		
	}

	ngOnInit(): void {
		this.loadGridData();

		if (this.changing) {
			this.changing.subscribe(() => {
				this.loadGridData();
			});
		}
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
		this.servicesService.getServiceConnectedProfessionals(this.serviceId).toPromise().then((resp) => {
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
		const dialogRef = this.dialog.open(ServiceProfessionalConnectDialogComponent, { data: this.serviceId });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			//this.spinner.show();
			this.loadGridData();
			this.reloadData.emit({ value: 'professional' });
			this.layoutUtilsService.showActionNotification("Changes saved successfully", MessageType.Create);
		});
	}

	detachProfessionals() {
		const _title = 'Connected professionals detach';
		const _description = 'Are you sure to permanently detach the services connections?';
		const _waitDesciption = 'Detaching...';
		const _deleteMessage = `Record(s) has been detached`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			var professionals = this.selection.selected;
			this.spinner.show();
			this.servicesService.detachProfessionalConnectedServices(professionals, this.serviceId).toPromise()
				.then((res) => {
					this.loadGridData();
					this.reloadData.emit('professional');
					this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
				}).catch((e) => {
					this.spinner.hide();
				}).finally(() => {
					this.spinner.hide();
				});
		});
	}

	addService() {
		const dialogRef = this.dialog.open(ServiceProfessionalConnectDialogComponent, { data: this.serviceId });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			this.loadGridData();
			this.reloadData.emit('professional');
			this.layoutUtilsService.showActionNotification("Changes saved successfully", MessageType.Create);
		});
	}


	removeService(serviceId: number) {
		const dialogRef = this.dialog.open(ConfirmDialogComponent, {
			width: '250px',
			data: { title: 'Professional detach', message: 'Are you sure to detach professional from this service?' }
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				this.spinner.show();
				this.servicesService.detachProfessionalConnectedServices([], this.serviceId).toPromise().then((res) => {
					if (res.success) {
						this.loadGridData();
						this.reloadData.emit('professional');
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

	ngOnDestroy(): void {

	}
	detectChanges() {
		try {
			this.cdr.detectChanges();
		} catch (e) {
			//console.log(e);
		}
	}

}
