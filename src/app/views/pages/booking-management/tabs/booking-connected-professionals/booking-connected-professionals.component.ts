import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Input, ViewChild } from '@angular/core';
import { MatTableDataSource, MatSort, MatPaginator } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { Observable, BehaviorSubject } from 'rxjs';
import { ApiResponse, BookingConnectedProfessionals, BookingService } from '../../../../../core/medelit';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'booking-connected-professionals',
	templateUrl: './booking-connected-professionals.component.html',
	styles: ['./booking-connected-professionals.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookingConnectedProfessinalsComponent implements OnInit, OnDestroy {
	@Input("bookingId") bookingId: number;
	@ViewChild(MatSort, { static: true }) sort: MatSort;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;


	displayedColumns: string[] = ['professional', 'phoneNumber', 'email', 'lastVisitDate', 'activeNonActive'];
	dataSource = new MatTableDataSource<BookingConnectedProfessionals>();
	selection = new SelectionModel<BookingConnectedProfessionals>(true, []);
	loadingSubject = new BehaviorSubject<boolean>(true);
	loading$: Observable<boolean>;

	constructor(
		private spinner: NgxSpinnerService,
		private bookingService: BookingService,
		private cdr: ChangeDetectorRef) {
	}

	ngOnInit(): void {
		
		this.spinner.show();
		this.bookingService.getBookingConnectedProfessionals(this.bookingId).toPromise().then((resp) => {
			var res = resp as unknown as ApiResponse;
			if (res.success) {
				this.dataSource = new MatTableDataSource<BookingConnectedProfessionals>(res.data);
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
