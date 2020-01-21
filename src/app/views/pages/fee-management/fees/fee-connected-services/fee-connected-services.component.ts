// Angular
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Input, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// Material
import { MatDialog, MatTableDataSource, MatSort, MatPaginator } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { fromEvent, merge, Observable, of, BehaviorSubject } from 'rxjs';
import { ApiResponse, CustomerConnectedServices, FeesService, ConnectedServicesModel } from '../../../../../core/medelit';
import { NgxSpinnerService } from 'ngx-spinner';
import { TypesUtilsService, LayoutUtilsService } from '../../../../../core/_base/crud';
import { SubheaderService, LayoutConfigService } from '../../../../../core/_base/layout';


@Component({
	// tslint:disable-next-line:component-selector
	selector: 'fee-connected-services',
	templateUrl: './fee-connected-services.component.html',
	styles: ['./fee-connected-services.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeeConnectedServicesComponent implements OnInit, OnDestroy {
	@Input("feeId") feeId: number;
	@ViewChild(MatSort, { static: true }) sort: MatSort;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;


	displayedColumns: string[] = ['service', 'field', 'subCategory'];
	dataSource = new MatTableDataSource<ConnectedServicesModel>();
	selection = new SelectionModel<ConnectedServicesModel>(true, []);
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
		private feeService: FeesService,
		private cdr: ChangeDetectorRef) {
	}

	ngOnInit(): void {
		
		this.spinner.show();
		this.feeService.getFeeConnectedServices(this.feeId).toPromise().then((resp) => {
			var res = resp as unknown as ApiResponse;
			if (res.success) {
				this.dataSource = new MatTableDataSource<ConnectedServicesModel>(res.data);
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
