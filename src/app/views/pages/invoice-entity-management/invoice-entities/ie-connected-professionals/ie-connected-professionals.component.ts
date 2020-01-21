// Angular
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Input, ViewChild } from '@angular/core';
import { MatTableDataSource, MatSort, MatPaginator } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { ApiResponse, CustomerConnectedProfessionals, InvoiceEntitiesService, InvoiceEntityConnectedProfessionals } from '../../../../../core/medelit';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'invoice-entity-connected-professionals',
	templateUrl: './ie-connected-professionals.component.html',
	styles: ['./ie-connected-professionals.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvoiceEntityConnectedProfessinalsComponent implements OnInit, OnDestroy {
	@Input("ieId") ieId: number;
	@ViewChild(MatSort, { static: true }) sort: MatSort;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

	displayedColumns: string[] = ['professional', 'phoneNumber', 'email', 'lastVisitDate', 'activeNonActive'];
	dataSource = new MatTableDataSource<InvoiceEntityConnectedProfessionals>();
	selection = new SelectionModel<InvoiceEntityConnectedProfessionals>(true, []);
	loadingSubject = new BehaviorSubject<boolean>(true);
	loading$: Observable<boolean>;

	constructor(
		private spinner: NgxSpinnerService,
		private invoiceEntityService: InvoiceEntitiesService,
		private cdr: ChangeDetectorRef) {
	}

	ngOnInit(): void {
		
		this.spinner.show();
		this.invoiceEntityService.getInvoiceEntityConnectedProfessionals(this.ieId).toPromise().then((resp) => {
			var res = resp as unknown as ApiResponse;
			if (res.success) {
				this.dataSource = new MatTableDataSource<InvoiceEntityConnectedProfessionals>(res.data);
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
