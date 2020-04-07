import { Component, OnInit, Inject, ChangeDetectionStrategy, ViewEncapsulation, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSort, MatPaginator, MatChipInputEvent } from '@angular/material';
import { Subscription, Observable } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { startWith, map, tap } from 'rxjs/operators';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { AddFeeToServiceDialogModel, FilterModel, ProfessionalConnectedServicesModel, ProfessionalsService, StaticDataService, ApiResponse, FeeDialogModel, ServicesService } from '../../../../../../core/medelit';
import { LayoutUtilsService, MessageType } from '../../../../../../core/_base/crud';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'eidt-service-professional-connect-dialog',
	templateUrl: './eidt-service-professional-connect.dialog.component.html',
	styleUrls: ['./eidt-service-professional-connect.dialog.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class EditServiceProfessionalRowDialog implements OnInit, OnDestroy {
	feeDiagModel: AddFeeToServiceDialogModel = new AddFeeToServiceDialogModel();

	viewLoading = false;
	feeForm: FormGroup;
	hasFormErrors = false;
	feeOption: FormControl = new FormControl("0");

	ptFeesForFilter: FilterModel[] = [];
	filteredPTFees: Observable<FilterModel[]>;

	proFeesForFilter: FilterModel[] = [];
	filteredPROFees: Observable<FilterModel[]>;

	constructor(public dialogRef: MatDialogRef<EditServiceProfessionalRowDialog>,
		@Inject(MAT_DIALOG_DATA) public data: ProfessionalConnectedServicesModel,
		private servicesService: ServicesService,
		private layoutUtilsService: LayoutUtilsService,
		private feeFB: FormBuilder,
		private staticService: StaticDataService,
		private cdr: ChangeDetectorRef) {
	}

	ngOnInit() {
		this.loadDialogData();
	}

	loadDialogData() {
		this.viewLoading = true;
		this.servicesService.getServiceProfesionalFeesRowDetail(this.data.ptFeeRowId).toPromise().then((resp) => {
			var res = resp as unknown as ApiResponse;
			if (res.success) {
				if (res.data == null)
					this.feeDiagModel = new AddFeeToServiceDialogModel();
				else
					this.feeDiagModel = res.data;
				this.createForm();
			}
		}).catch(() => {
			this.viewLoading = false;
		});
	}

	createForm() {
		this.feeForm = this.feeFB.group({
			ptFeeId: [this.feeDiagModel.ptFeeId, Validators.required],		
			proFeeId: [this.feeDiagModel.proFeeId, Validators.required],			
		});
		this.loadPTFeesForFilter();
	}


	onSumbit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.feeForm.controls;
		/** check form */
		if (this.feeForm.invalid) {
			Object.keys(controls).forEach(controlName => {
				controls[controlName].markAsTouched();
			});

			this.hasFormErrors = true;
			window.scroll(0, 0);
			return;
		}

		this.viewLoading = true;
		this.servicesService.saveServiceProfessionalFee(this.prepareFee(), this.data.ptFeeRowId).toPromise().then((res) => {
			if (res.success) {
				this.layoutUtilsService.showActionNotification("Changes saved successfully", MessageType.Create);
				this.dialogRef.close(res.success);
			}
		}).catch(() => {
			this.viewLoading = false;
			this.layoutUtilsService.showActionNotification("An error occured while processing your request", MessageType.Create, 3000);
		}).finally(() => {
			this.viewLoading = false;
		});
	}

	prepareFee(): FeeDialogModel {
		const controls = this.feeForm.controls;
		const _fee = new FeeDialogModel();

		if (controls.ptFeeId.value)
			_fee.ptFeeId = +controls.ptFeeId.value.id;

		if (controls.proFeeId.value)
			_fee.proFeeId = +controls.proFeeId.value.id;

		return _fee;
	}

	ngOnDestroy(): void {

	}


	// PT Fees Filter
	loadPTFeesForFilter() {
		this.viewLoading = true;
		this.servicesService.getFeesForFilter(this.data.ptFeeRowId).toPromise().then(res => {
			this.ptFeesForFilter = res.data.pt;
			this.proFeesForFilter = res.data.pro;

			this.filteredPTFees = this.feeForm.get('ptFeeId').valueChanges
				.pipe(
					startWith(''),
					map(value => this._filterPTFees(value))
				);

			if (this.data.ptFeeId > 0) {
				var vat = this.ptFeesForFilter.find(x => x.id == this.data.ptFeeId);
				if (vat) {
					// @ts-ignore
					this.feeForm.patchValue({ 'ptFeeId': { id: vat.id, value: vat.value } });
				}
			}

			this.filteredPROFees = this.feeForm.get('proFeeId').valueChanges
				.pipe(
					startWith(''),
					map(value => this._filterPROFees(value))
				);

			if (this.data.proFeeId > 0) {
				var vat = this.proFeesForFilter.find(x => x.id == this.data.proFeeId);
				if (vat) {
					// @ts-ignore
					this.feeForm.patchValue({ 'proFeeId': { id: vat.id, value: vat.value } });
				}
			}

		}).catch(() => {
			this.viewLoading = false;
		}).finally(() => {
			this.viewLoading = false;
			this.detectChanges();
		});
	}
	private _filterPTFees(value: string): FilterModel[] {
		const filterValue = this._normalizeValue(value);
		return this.ptFeesForFilter.filter(elem => this._normalizeValue(elem.value).includes(filterValue));
	}

	private _filterPROFees(value: string): FilterModel[] {
		const filterValue = this._normalizeValue(value);
		return this.proFeesForFilter.filter(elem => this._normalizeValue(elem.value).includes(filterValue));
	}


	/// End PT Fees for filter
	displayFn(option: FilterModel): string {
		if (option)
			return option.value;
		return '';
	}

	private _normalizeValue(value: string): string {
		if (value && value.length > 0)
			return value.toLowerCase().replace(/\s/g, '');
		return value;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

	detectChanges() {
		try {
			this.cdr.detectChanges();
		} catch{

		}
	}
}
