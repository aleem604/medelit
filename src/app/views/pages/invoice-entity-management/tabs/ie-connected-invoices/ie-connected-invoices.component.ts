// Angular
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Input, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// Material
import { MatTableDataSource, MatSort, MatPaginator } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { ApiResponse, InvoiceEntitiesService, InvoiceEntityConnectedInvoices } from '../../../../../core/medelit';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'invoice-entity-connected-invoices',
	templateUrl: './ie-connected-invoices.component.html',
	styles: ['./ie-connected-invoices.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvoiceEntityConnectedInvoicesComponent implements OnInit, OnDestroy {
	@Input("ieId") ieId: number;
	@ViewChild(MatSort, { static: true }) sort: MatSort;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;


	displayedColumns: string[] = ['subject', 'invoiceNumber', 'invoiceDate', 'totalInvoice'];
	dataSource = new MatTableDataSource<InvoiceEntityConnectedInvoices>();
	selection = new SelectionModel<InvoiceEntityConnectedInvoices>(true, []);
	loadingSubject = new BehaviorSubject<boolean>(true);
	loading$: Observable<boolean>;

	constructor(
		private spinner: NgxSpinnerService,
		private invoiceEntityService: InvoiceEntitiesService,
		private cdr: ChangeDetectorRef) {
	}

	ngOnInit(): void {
		
		this.spinner.show();
		this.invoiceEntityService.getInvoiceEntityConnectedInvoices(this.ieId).toPromise().then((resp) => {
			var res = resp as unknown as ApiResponse;
			if (res.success) {
				this.dataSource = new MatTableDataSource<InvoiceEntityConnectedInvoices>(res.data);
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
