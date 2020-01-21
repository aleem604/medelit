// Angular
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Input, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// Material
import { MatDialog, MatTableDataSource, MatSort, MatPaginator } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { fromEvent, merge, Observable, of, BehaviorSubject } from 'rxjs';
import { ApiResponse, CustomerConnectedProfessionals, CustomersService } from '../../../../../core/medelit';
import { NgxSpinnerService } from 'ngx-spinner';
import { TypesUtilsService, LayoutUtilsService } from '../../../../../core/_base/crud';
import { SubheaderService, LayoutConfigService } from '../../../../../core/_base/layout';


@Component({
	// tslint:disable-next-line:component-selector
	selector: 'customer-connected-professionals',
	templateUrl: './customer-connected-professionals.component.html',
	styles: ['./customer-connected-professionals.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomerConnectedProfessinalsComponent implements OnInit, OnDestroy {
	@Input("customerId") customerId: number;
	@ViewChild(MatSort, { static: true }) sort: MatSort;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;


	displayedColumns: string[] = ['professional', 'phoneNumber', 'email', 'lastVisitDate', 'activeNonActive'];
	dataSource = new MatTableDataSource<CustomerConnectedProfessionals>();
	selection = new SelectionModel<CustomerConnectedProfessionals>(true, []);
	loadingSubject = new BehaviorSubject<boolean>(true);
	loading$: Observable<boolean>;

	constructor(
		private spinner: NgxSpinnerService,
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private typesUtilsService: TypesUtilsService,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private layoutConfigService: LayoutConfigService,
		private customerService: CustomersService,
		private cdr: ChangeDetectorRef) {
	}

	ngOnInit(): void {
		
		this.spinner.show();
		this.customerService.getCustomerConnectedProfessionals(this.customerId).toPromise().then((resp) => {
			var res = resp as unknown as ApiResponse;
			if (res.success) {
				this.dataSource = new MatTableDataSource<CustomerConnectedProfessionals>(res.data);
				this.dataSource.paginator = this.paginator;
				this.dataSource.sort = this.sort;
			}
		}).finally(() => {
			this.spinner.hide();
		});

	}

	ngOnDestroy(): void {

	}

	getComponentTitle() {
		let result = 'Create professional';
		
		result = `Connected Customers`;
		return result;
	}
	
}
