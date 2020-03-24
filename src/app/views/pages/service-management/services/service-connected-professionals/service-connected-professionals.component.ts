// Angular
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Input, ViewChild } from '@angular/core';
// Material
import { MatDialog, MatTableDataSource, MatSort, MatPaginator } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { Observable, BehaviorSubject } from 'rxjs';
import { ProfessionalsService, ApiResponse, ServiceConnectedProfessionals, ServicesService } from '../../../../../core/medelit';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'service-connected-professionals',
	templateUrl: './service-connected-professionals.component.html',
	styleUrls: ['./service-connected-professionals.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ServiceConnectedProfessionalsComponent implements OnInit, OnDestroy {
	@Input("serviceId") serviceId: number;
	@ViewChild(MatSort, { static: true }) sort: MatSort;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;


	displayedColumns: string[] = ['proName', 'phone', 'email', 'status'];
	dataSource = new MatTableDataSource<ServiceConnectedProfessionals>();
	selection = new SelectionModel<ServiceConnectedProfessionals>(true, []);
	loadingSubject = new BehaviorSubject<boolean>(true);
	loading$: Observable<boolean>;

	constructor(
		private spinner: NgxSpinnerService,
		private serviceService: ServicesService,
		private cdr: ChangeDetectorRef) {
	}

	ngOnInit(): void {

		this.spinner.show();
		this.serviceService.getServiceProfessionals(this.serviceId).toPromise().then((resp) => {
			var res = resp as unknown as ApiResponse;
			if (res.success) {
				this.dataSource = new MatTableDataSource<ServiceConnectedProfessionals>(res.data);
				this.dataSource.paginator = this.paginator;
				this.dataSource.sort = this.sort;
			}
		}).catch(() => {
			this.spinner.hide();
		}).finally(() => {
			this.spinner.hide();
		});
	}


	ngOnDestroy(): void {

	}

	isFuture(row: any) {
		if (row.visitDate) {
			var date = new Date(row.visitDate);
			return date > new Date() ? 1 : 0;
		}
		return -1;
	}

}
