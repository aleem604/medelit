// Angular
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Input, ViewChild } from '@angular/core';
// Material
import { MatTableDataSource, MatSort, MatPaginator } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { ApiResponse, InvoiceConnectedProfessionals, InvoicesService } from '../../../../../core/medelit';
import { NgxSpinnerService } from 'ngx-spinner';


@Component({
	// tslint:disable-next-line:component-selector
	selector: 'invoice-connected-professionals',
	templateUrl: './invoice-connected-professionals.component.html',
	styles: ['./invoice-connected-professionals.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvoiceConnectedProfessinalsComponent implements OnInit, OnDestroy {
	@Input("invoiceId") invoiceId: number;
	@ViewChild(MatSort, { static: true }) sort: MatSort;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;


	displayedColumns: string[] = ['professional', 'phoneNumber', 'email', 'lastVisitDate', 'activeNonActive'];
	dataSource = new MatTableDataSource<InvoiceConnectedProfessionals>();
	selection = new SelectionModel<InvoiceConnectedProfessionals>(true, []);
	loadingSubject = new BehaviorSubject<boolean>(true);
	loading$: Observable<boolean>;

	constructor(
		private spinner: NgxSpinnerService,
		private invoiceService: InvoicesService,
		private cdr: ChangeDetectorRef) {
	}

	ngOnInit(): void {
		
		this.spinner.show();
		this.invoiceService.getInvoiceConnectedProfessionals(this.invoiceId).toPromise().then((resp) => {
			var res = resp as unknown as ApiResponse;
			if (res.success) {
				this.dataSource = new MatTableDataSource<InvoiceConnectedProfessionals>(res.data);
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
