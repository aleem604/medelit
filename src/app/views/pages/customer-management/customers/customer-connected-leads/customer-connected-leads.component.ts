// Angular
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, Input, ViewChild } from '@angular/core';
// Material
import { MatDialog, MatTableDataSource, MatSort, MatPaginator } from '@angular/material';
import {  Observable, BehaviorSubject } from 'rxjs';
import { CustomerConnectedLeads, CustomersService, ApiResponse } from '../../../../../core/medelit';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'customer-connected-leads',
	templateUrl: './customer-connected-leads.component.html',
	styleUrls: ['./customer-connected-leads.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomerConnectedLeadsComponent implements OnInit, OnDestroy {
	@Input("customerId") customerId: number;
	@ViewChild(MatSort, { static: true }) sort: MatSort;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;


	displayedColumns: string[] = ['leadName', 'createDate', 'updateDate', 'professional'];
	dataSource = new MatTableDataSource<CustomerConnectedLeads>();
	loadingSubject = new BehaviorSubject<boolean>(true);
	loading$: Observable<boolean>;

	constructor(
		private spinner: NgxSpinnerService,
		private customerService: CustomersService) {
	}

	ngOnInit(): void {

		this.spinner.show();
		this.customerService.getCustomerConnectedLeads(this.customerId).toPromise().then((resp) => {
			var res = resp as unknown as ApiResponse;
			if (res.success) {
				this.dataSource = new MatTableDataSource<CustomerConnectedLeads>(res.data);
				this.dataSource.paginator = this.paginator;
				this.dataSource.sort = this.sort;
			}
		}).finally(() => {
			this.spinner.hide();
		});
	}


	ngOnDestroy(): void {

	}

	isHot(row: any) {
		if (row.leadStatusId == 1) {
			return 1;
		} else {
			return 0;
		}
	}
}
