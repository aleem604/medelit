// Angular
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Input, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// Material
import { MatDialog, MatTableDataSource, MatSort, MatPaginator } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { fromEvent, merge, Observable, of, BehaviorSubject } from 'rxjs';
import { ApiResponse, CustomerConnectedServices, BookingService, BookingConnectedBookings } from '../../../../../core/medelit';
import { NgxSpinnerService } from 'ngx-spinner';
import { TypesUtilsService, LayoutUtilsService } from '../../../../../core/_base/crud';
import { SubheaderService, LayoutConfigService } from '../../../../../core/_base/layout';


@Component({
	// tslint:disable-next-line:component-selector
	selector: 'booking-connected-bookings',
	templateUrl: './booking-connected-bookings.component.html',
	styles: ['./booking-connected-bookings.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookingConnectedBookingsComponent implements OnInit, OnDestroy {
	@Input("bookingId") bookingId: number;
	@ViewChild(MatSort, { static: true }) sort: MatSort;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;


	displayedColumns: string[] = ['bookingName', 'serviceName', 'professional', 'cycleNumber', 'ptFee', 'proFee', 'subTotal'];
	dataSource = new MatTableDataSource<BookingConnectedBookings>();
	selection = new SelectionModel<BookingConnectedBookings>(true, []);
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
		private bookingService: BookingService,
		private cdr: ChangeDetectorRef) {
	}

	ngOnInit(): void {
		
		this.spinner.show();
		this.bookingService.getBookingConnectedBookings(this.bookingId).toPromise().then((resp) => {
			var res = resp as unknown as ApiResponse;
			if (res.success) {
				this.dataSource = new MatTableDataSource<BookingConnectedBookings>(res.data);
				this.dataSource.paginator = this.paginator;
				this.dataSource.sort = this.sort;
			}
		}).finally(() => {
			this.spinner.hide();
		});
	}

	getTotalCost() {
		return this.dataSource.data.map(t => t.subTotal).reduce((acc, value) => acc + value, 0);
	}

	ngOnDestroy(): void {

	}	
}
