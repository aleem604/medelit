// Angular
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Input, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// Material
import { MatDialog, MatTableDataSource, MatSort, MatPaginator } from '@angular/material';
import { fromEvent, merge, Observable, of, BehaviorSubject } from 'rxjs';
import { ApiResponse, ServicesService, ServiceConnectedLeads } from '../../../../../core/medelit';
import { NgxSpinnerService } from 'ngx-spinner';
import { TypesUtilsService, LayoutUtilsService } from '../../../../../core/_base/crud';
import { SubheaderService, LayoutConfigService } from '../../../../../core/_base/layout';


@Component({
	// tslint:disable-next-line:component-selector
	selector: 'service-connected-leads',
	templateUrl: './service-connected-leads.component.html',
	styleUrls: ['./service-connected-leads.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ServiceConnectedLeadsComponent implements OnInit, OnDestroy {
	@Input("serviceId") serviceId: number;
	@ViewChild(MatSort, { static: true }) sort: MatSort;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;


	displayedColumns: string[] = ['service', 'createDate', 'updateDate', 'professional'];
	dataSource = new MatTableDataSource<ServiceConnectedLeads>();
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
		this.servicesService.getConnectedLeads(this.serviceId).toPromise().then((resp) => {
			var res = resp as unknown as ApiResponse;
			if (res.success) {
				this.dataSource = new MatTableDataSource<ServiceConnectedLeads>(res.data);
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
