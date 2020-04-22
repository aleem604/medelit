// Angular
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Input, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// Material
import { MatDialog, MatTableDataSource, MatSort, MatPaginator } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { fromEvent, merge, Observable, of, BehaviorSubject } from 'rxjs';
import { ApiResponse, CustomerConnectedBookings, CustomersService } from '../../../../../core/medelit';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'customer-connected-bookings',
	templateUrl: './customer-connected-bookings.component.html',
	styleUrls: ['./customer-connected-bookings.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomerConnectedBookingsComponent implements OnInit, OnDestroy {
	@Input("customerId") customerId: number;
	@ViewChild(MatSort, { static: true }) sort: MatSort;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;


	displayedColumns: string[] = ['bookingName', 'serviceFees', 'professional', 'visitDate'];
	dataSource = new MatTableDataSource<CustomerConnectedBookings>();
	selection = new SelectionModel<CustomerConnectedBookings>(true, []);
	loadingSubject = new BehaviorSubject<boolean>(true);
	loading$: Observable<boolean>;

	constructor(
		private spinner: NgxSpinnerService,
		private customerService: CustomersService) {
	}

	ngOnInit(): void {
		
		this.spinner.show();
		this.customerService.getCustomerConnectedBookings(this.customerId).toPromise().then((resp) => {
			var res = resp as unknown as ApiResponse;
			if (res.success) {
				this.dataSource = new MatTableDataSource<CustomerConnectedBookings>(res.data);
				this.dataSource.paginator = this.paginator;
				this.dataSource.sort = this.sort;
			}
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
