import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Input, ViewChild } from '@angular/core';
import { MatTableDataSource, MatSort, MatPaginator } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { fromEvent, merge, Observable, of, BehaviorSubject } from 'rxjs';
import { ConnectedCustomers, ApiResponse, InvoicesService, InvoiceConnectedInvoiceEntities } from '../../../../../core/medelit';
import { NgxSpinnerService } from 'ngx-spinner';


@Component({
	// tslint:disable-next-line:component-selector
	selector: 'invoice-connected-invoice-entities',
	templateUrl: './invoice-connected-invoice-entities.component.html',
	styles: ['./invoice-connected-invoice-entities.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvoiceConnectedInvoieEntitiesComponent implements OnInit, OnDestroy {
	@Input("invoiceId") invoiceId: number;
	@ViewChild(MatSort, { static: true }) sort: MatSort;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;


	displayedColumns: string[] = ['invoiceEntity', 'customer', 'phoneNumber', 'email', 'service', 'visitDate', 'professional'];
	dataSource = new MatTableDataSource<InvoiceConnectedInvoiceEntities>();
	selection = new SelectionModel<InvoiceConnectedInvoiceEntities>(true, []);
	loadingSubject = new BehaviorSubject<boolean>(true);
	loading$: Observable<boolean>;

	constructor(
		private spinner: NgxSpinnerService,
		private invoiceService: InvoicesService,
		private cdr: ChangeDetectorRef) {
	}

	ngOnInit(): void {

		this.spinner.show();
		this.invoiceService.getInvoiceConnectedInvoiceEntities(this.invoiceId).toPromise().then((resp) => {
			var res = resp as unknown as ApiResponse;
			if (res.success) {
				this.dataSource = new MatTableDataSource<InvoiceConnectedInvoiceEntities>(res.data);
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
