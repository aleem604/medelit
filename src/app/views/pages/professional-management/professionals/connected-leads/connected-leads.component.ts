// Angular
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Input, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// Material
import { MatDialog, MatTableDataSource, MatSort, MatPaginator } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { fromEvent, merge, Observable, of, BehaviorSubject } from 'rxjs';
import { ConnectedCustomers, ProfessionalsService, ApiResponse, ConnectedLeads } from '../../../../../core/medelit';
import { NgxSpinnerService } from 'ngx-spinner';
import { TypesUtilsService, LayoutUtilsService } from '../../../../../core/_base/crud';
import { SubheaderService, LayoutConfigService } from '../../../../../core/_base/layout';


@Component({
	// tslint:disable-next-line:component-selector
	selector: 'connected-leads',
	templateUrl: './connected-leads.component.html',
	styleUrls: ['./connected-leads.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConnectedLeadsComponent implements OnInit, OnDestroy {
	@Input("proId") proId: number;
	@ViewChild(MatSort, { static: true }) sort: MatSort;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;


	displayedColumns: string[] = ['service', 'createDate', 'updateDate', 'professional'];
	dataSource = new MatTableDataSource<ConnectedLeads>();
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
		private professionalService: ProfessionalsService,
		private cdr: ChangeDetectorRef) {
	}

	ngOnInit(): void {

		this.spinner.show();
		this.professionalService.getConnectedLeads(this.proId).toPromise().then((resp) => {
			var res = resp as unknown as ApiResponse;
			if (res.success) {
				this.dataSource = new MatTableDataSource<ConnectedLeads>(res.data);
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


	getItemStatusString(status: number = 0): string {
		switch (status) {
			case 0:
				return 'Pending';
			case 1:
				return 'Active';
			case 2:
				return 'Suspended';
		}
		return '';
	}

	getItemCssClassByStatus(status: number = 0): string {
		switch (status) {
			case 0:
				return 'metal';
			case 1:
				return 'success';
			case 2:
				return 'danger';
		}
		return '';
	}

	getItemConditionString(condition: number = 0): string {
		switch (condition) {
			case 0:
				return 'New';
			case 1:
				return 'Used';
		}
		return '';
	}

	getItemCssClassByCondition(condition: number = 0): string {
		switch (condition) {
			case 0:
				return 'accent';
			case 1:
				return 'primary';
		}
		return '';
	}
}
