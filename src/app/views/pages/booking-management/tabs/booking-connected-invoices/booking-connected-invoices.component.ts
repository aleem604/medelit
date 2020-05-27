// Angular
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Input, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// Material
import { MatTableDataSource, MatSort, MatPaginator } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { ApiResponse, BookingConnectedInvoices, BookingService } from '../../../../../core/medelit';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'booking-connected-invoices',
	templateUrl: './booking-connected-invoices.component.html',
	styles: ['./booking-connected-invoices.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookingConnectedInvoicesComponent implements OnInit, OnDestroy {
	@Input("bookingId") bookingId: number;
	@ViewChild(MatSort, { static: true }) sort: MatSort;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;


	displayedColumns: string[] = ['subject', 'invoiceNumber', 'ieName', 'invoiceDate', 'invoiceDueDate', 'totalInvoice'];
	dataSource = new MatTableDataSource<BookingConnectedInvoices>();
	selection = new SelectionModel<BookingConnectedInvoices>(true, []);
	loadingSubject = new BehaviorSubject<boolean>(true);
	loading$: Observable<boolean>;

	constructor(
		private spinner: NgxSpinnerService,
		private bookingService: BookingService,
		private cdr: ChangeDetectorRef) {
	}

	ngOnInit(): void {
		
		this.spinner.show();
		this.bookingService.getBookingConnectedInvoices(this.bookingId).toPromise().then((resp) => {
			var res = resp as unknown as ApiResponse;
			if (res.success) {
				this.dataSource = new MatTableDataSource<BookingConnectedInvoices>(res.data);
				this.dataSource.paginator = this.paginator;
				this.dataSource.sort = this.sort;
			}
		}).finally(() => {
			this.spinner.hide();
		});

	}

	ngOnDestroy(): void {

	}

	
}
