import { Component, OnInit, Inject, ChangeDetectionStrategy, ViewEncapsulation, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSort, MatPaginator, MatTableDataSource } from '@angular/material';
import { Subscription, Observable } from 'rxjs';
import { LayoutUtilsService, MessageType } from '../../../../../core/_base/crud';
import {
	ApiResponse,
	FilterModel,
	StaticDataService,
	FeesService,
	AttachProToFeeDialogModel,
	selectLastCreatedServiceId,
	AttachFeesToProServiceDialogModel,
    FeeModel
} from '../../../../../core/medelit';
import { SelectionModel } from '@angular/cdk/collections';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormControl } from '@angular/forms';
import { startWith, map } from 'rxjs/operators';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'attach-fees-to-pro-service-dialog',
	templateUrl: './attach-fees-to-pro-service.dialog.component.html',
	styleUrls: ['./attach-fees-to-pro-service.dialog.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AttachFeesToProServiceDialogComponent implements OnInit, OnDestroy {
	proService: AttachFeesToProServiceDialogModel;
	@ViewChild(MatSort, { static: true }) sort: MatSort;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	viewLoading = false;
	hasFormErrors = false;
	feeOption: FormControl = new FormControl("0");

	serviceControl: FormControl = new FormControl();
	servicesForFilter: FilterModel[];
	filteredServices: Observable<FilterModel[]>;

	professionaControl: FormControl = new FormControl();
	professionalsForFitlers: FilterModel[];
	filteredProfessionals: Observable<FilterModel[]>;

	private subscriptions: Subscription[] = [];

	constructor(public dialogRef: MatDialogRef<AttachFeesToProServiceDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: Array<FeeModel>,
		private feesService: FeesService,
		private spinner: NgxSpinnerService,
		private layoutUtilsService: LayoutUtilsService,
		private staticService: StaticDataService,
		private cdr: ChangeDetectorRef) {
	}

	ngOnInit() {
		this.loadServiceForFilter();
	}

	saveConnections() {

		if (!(this.serviceControl.value && this.professionaControl.value)) {
			this.hasFormErrors = true;
			return;
		}
		var serviceId = this.serviceControl.value.id;
		var proId = this.professionaControl.value.id;
		this.viewLoading = true;
		this.feesService.connectFeesToProfessionalAndService(serviceId, proId, this.data).toPromise().then((res) => {
			if (res.success) {
				this.layoutUtilsService.showActionNotification("Changes saved successfully", MessageType.Create);
				this.dialogRef.close(true);
			}
		}).catch(() => {
			this.viewLoading = false;
			this.layoutUtilsService.showActionNotification("An error occured while processing your request", MessageType.Create, 3000);
		}).finally(() => {
			this.viewLoading = false;
		});

	}

	// PT Fees Filter
	loadServiceForFilter() {
		this.staticService.getServicesForFilter().subscribe(res => {
			this.servicesForFilter = res.data;

			this.filteredServices = this.serviceControl.valueChanges
				.pipe(
					startWith(''),
					map(value => this._filterPTFees(value))
				);
		});
	}
	private _filterPTFees(value: string): FilterModel[] {
		const filterValue = this._normalizeValue(value);
		return this.servicesForFilter.filter(elem => this._normalizeValue(elem.value).includes(filterValue));
	}

	serviceControlClosed() {
		if (this.serviceControl.value) {
			this.loadProfessionalsForFilter(this.serviceControl.value.id);
		} else {
			this.professionaControl.setValue('');
		}
	}

	/// End PT Fees for filter

	// PRO Fees Filter
	loadProfessionalsForFilter(servieId: number) {
		this.staticService.getProfessionalsForFilter(servieId).subscribe(res => {
			this.professionalsForFitlers = res.data;

			this.filteredProfessionals = this.professionaControl.valueChanges
				.pipe(
					startWith(''),
					map(value => this._filterPROFees(value))
				);
		});
	}

	private _filterPROFees(value: string): FilterModel[] {
		const filterValue = this._normalizeValue(value);
		return this.professionalsForFitlers.filter(elem => this._normalizeValue(elem.value).includes(filterValue));
	}

	private _normalizeValue(value: string): string {
		if (value && value.length > 0)
			return value.toLowerCase().replace(/\s/g, '');
		return value;
	}

	displayFn(option: FilterModel): string {
		if (option)
			return option.value;
		return '';
	}

	ngOnDestroy(): void {
		this.subscriptions.forEach(el => el.unsubscribe());
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

}
