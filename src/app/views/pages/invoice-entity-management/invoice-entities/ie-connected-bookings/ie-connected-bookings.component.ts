// Angular
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Input, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// Material
import { MatDialog, MatTableDataSource, MatSort, MatPaginator } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { fromEvent, merge, Observable, of, BehaviorSubject } from 'rxjs';
import { ApiResponse, InvoiceEntitiesService, InvoiceEntityConnectedBookings } from '../../../../../core/medelit';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'invoice-entity-connected-bookings',
	templateUrl: './ie-connected-bookings.component.html',
	styleUrls: ['./ie-connected-bookings.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvoieEntityConnectedBookingsComponent implements OnInit, OnDestroy {
	@Input("ieId") ieId: number;
	@ViewChild(MatSort, { static: true }) sort: MatSort;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

	displayedColumns: string[] = ['bookingName', 'serviceFees', 'professional', 'visitDate'];
	dataSource = new MatTableDataSource<InvoiceEntityConnectedBookings>();
	selection = new SelectionModel<InvoiceEntityConnectedBookings>(true, []);
	loadingSubject = new BehaviorSubject<boolean>(true);
	loading$: Observable<boolean>;

	constructor(
		private spinner: NgxSpinnerService,
		private ieService: InvoiceEntitiesService) {
	}

	ngOnInit(): void {
		
		this.spinner.show();
		this.ieService.getInvoiceEntityConnectedBookings(this.ieId).toPromise().then((resp) => {
			var res = resp as unknown as ApiResponse;
			if (res.success) {
				this.dataSource = new MatTableDataSource<InvoiceEntityConnectedBookings>(res.data);
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
