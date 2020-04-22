// Angular
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Input, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// Material
import { MatDialog, MatTableDataSource, MatSort, MatPaginator } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { Observable, BehaviorSubject } from 'rxjs';
import { ProfessionalsService, ApiResponse, ServiceConnectedBookings, ServicesService } from '../../../../../core/medelit';
import { NgxSpinnerService } from 'ngx-spinner';
import { TypesUtilsService, LayoutUtilsService } from '../../../../../core/_base/crud';
import { SubheaderService, LayoutConfigService } from '../../../../../core/_base/layout';


@Component({
	// tslint:disable-next-line:component-selector
	selector: 'service-connected-bookings',
	templateUrl: './service-connected-bookings.component.html',
	styleUrls: ['./service-connected-bookings.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ServiceConnectedBookingsComponent implements OnInit, OnDestroy {
	@Input("serviceId") serviceId: number;
	@ViewChild(MatSort, { static: true }) sort: MatSort;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;


	displayedColumns: string[] = ['bookingName', 'serviceFees', 'customer', 'invoiceEntity', 'visitDate'];
	dataSource = new MatTableDataSource<ServiceConnectedBookings>();
	selection = new SelectionModel<ServiceConnectedBookings>(true, []);
	loadingSubject = new BehaviorSubject<boolean>(true);
	loading$: Observable<boolean>;

	constructor(
		private spinner: NgxSpinnerService,
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private typesUtilsService: TypesUtilsService,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private layoutConfigService: LayoutConfigService,
		private serviceService: ServicesService,
		private cdr: ChangeDetectorRef) {
	}

	ngOnInit(): void {

		this.spinner.show();
		this.serviceService.getConnectedBookings(this.serviceId).toPromise().then((resp) => {
			var res = resp as unknown as ApiResponse;
			if (res.success) {
				this.dataSource = new MatTableDataSource<ServiceConnectedBookings>(res.data);
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
