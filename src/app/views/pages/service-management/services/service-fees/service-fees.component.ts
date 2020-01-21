// Angular
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Input, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// Material
import { MatDialog, MatTableDataSource, MatSort, MatPaginator } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { Observable, BehaviorSubject } from 'rxjs';
import { ConnectedCustomers, ApiResponse, ServicesService } from '../../../../../core/medelit';
import { NgxSpinnerService } from 'ngx-spinner';
import { TypesUtilsService, LayoutUtilsService } from '../../../../../core/_base/crud';
import { SubheaderService, LayoutConfigService } from '../../../../../core/_base/layout';


@Component({
	// tslint:disable-next-line:component-selector
	selector: 'service-professional-fees',
	templateUrl: './service-fees.component.html',
	styleUrls: ['./service-fees.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ServiceFeesComponent implements OnInit, OnDestroy {
	@Input('serviceId') serviceId: number;
	@ViewChild(MatSort, { static: true }) sort: MatSort;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;


	displayedColumns: string[] = ['professional', 'ptFeeName', 'ptFeeA1', 'ptFeeA2', 'proFeeName', 'proFeeA1', 'proFeeA2'];
	dataSource = new MatTableDataSource<ConnectedCustomers>();
	selection = new SelectionModel<ConnectedCustomers>(true, []);
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
		private servicesService: ServicesService,
		private cdr: ChangeDetectorRef) {
	}

	ngOnInit(): void {
		
		this.spinner.show();
		this.servicesService.getProfessionalFeesInfo(this.serviceId).toPromise().then((resp) => {
			var res = resp as unknown as ApiResponse;
			if (res.success) {
				this.dataSource = new MatTableDataSource<ConnectedCustomers>(res.data);
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
