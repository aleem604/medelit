// Angular
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Input, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// Material
import { MatDialog, MatTableDataSource, MatSort, MatPaginator } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { fromEvent, merge, Observable, of, BehaviorSubject } from 'rxjs';
import { ApiResponse, InvoiceConnectedBookings, InvoicesService } from '../../../../../core/medelit';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'invoice-connected-bookings',
	templateUrl: './invoice-connected-bookings.component.html',
	styleUrls: ['./invoice-connected-bookings.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvoiceConnectedBookingsComponent implements OnInit, OnDestroy {
	@Input("invoiceId") invoiceId: number;
	@ViewChild(MatSort, { static: true }) sort: MatSort;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

	displayedColumns: string[] = ['bookingName', 'serviceFees', 'professional', 'visitDate'];
	dataSource = new MatTableDataSource<InvoiceConnectedBookings>();
	selection = new SelectionModel<InvoiceConnectedBookings>(true, []);
	loadingSubject = new BehaviorSubject<boolean>(true);
	loading$: Observable<boolean>;

	constructor(
		private spinner: NgxSpinnerService,
		private invoiceService: InvoicesService) {
	}

	ngOnInit(): void {
		
		this.spinner.show();
		this.invoiceService.getInvoiceConnectedBookings(this.invoiceId).toPromise().then((resp) => {
			var res = resp as unknown as ApiResponse;
			if (res.success) {
				this.dataSource = new MatTableDataSource<InvoiceConnectedBookings>(res.data);
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
		if (row.statusId === 4) {
			return true;
		}
		return 0;
	}
}
