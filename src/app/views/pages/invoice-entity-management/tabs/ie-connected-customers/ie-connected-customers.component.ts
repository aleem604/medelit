// Angular
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Input, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// Material
import { MatDialog, MatTableDataSource, MatSort, MatPaginator } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { fromEvent, merge, Observable, of, BehaviorSubject } from 'rxjs';
import { ApiResponse, CustomerConnectedCustomers, InvoiceEntitiesService, InvoiceEntityConnectedCustomers } from '../../../../../core/medelit';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'invoice-entity-connected-customers',
	templateUrl: './ie-connected-customers.component.html',
	styles: ['./ie-connected-customers.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvoiceEntityConnectedCustomersComponent implements OnInit, OnDestroy {
	@Input("ieId") ieId: number;
	@ViewChild(MatSort, { static: true }) sort: MatSort;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;


	displayedColumns: string[] = ['title', 'phone', 'email', 'services', 'professional'];
	dataSource = new MatTableDataSource<InvoiceEntityConnectedCustomers>();
	selection = new SelectionModel<InvoiceEntityConnectedCustomers>(true, []);
	loadingSubject = new BehaviorSubject<boolean>(true);
	loading$: Observable<boolean>;

	constructor(
		private spinner: NgxSpinnerService,
		private invoiceEntityService: InvoiceEntitiesService,
		private cdr: ChangeDetectorRef) {
	}

	ngOnInit(): void {
		
		this.spinner.show();
		this.invoiceEntityService.getInvoiceEntityConnectedCustomers(this.ieId).toPromise().then((resp) => {
			var res = resp as unknown as ApiResponse;
			if (res.success) {
				this.dataSource = new MatTableDataSource<InvoiceEntityConnectedCustomers>(res.data);
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
