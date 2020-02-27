import { Component, OnInit, Inject, ChangeDetectionStrategy, ViewEncapsulation, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSort, MatPaginator, MatChipInputEvent } from '@angular/material';
import { Subscription, Observable } from 'rxjs';
import { LayoutUtilsService, MessageType } from '../../../../../core/_base/crud';
import {
	ApiResponse,
	FilterModel,
	StaticDataService,
	FeeDialogModel,
	AddFeeToServiceDialogModel,
	ProfessionalsService,
	ProfessionalConnectedServicesModel
} from '../../../../../core/medelit';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { startWith, map, tap } from 'rxjs/operators';
import { ENTER, COMMA } from '@angular/cdk/keycodes';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'add-fee-to-service-dialog',
	templateUrl: './add-fee-to-service.dialog.component.html',
	styleUrls: ['./add-fee-to-service.dialog.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class AddFeeToServiceDialogComponent implements OnInit, OnDestroy {
	feeDiagModel: AddFeeToServiceDialogModel = new AddFeeToServiceDialogModel();
	@ViewChild(MatSort, { static: true }) sort: MatSort;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	viewLoading = false;
	feeForm: FormGroup;
	hasFormErrors = false;
	feeOption: FormControl = new FormControl("0");

	ptFeesForFilter: FilterModel[] = [];
	filteredPTFees: Observable<FilterModel[]>;

	proFeesForFilter: FilterModel[] = [];
	filteredPROFees: Observable<FilterModel[]>;

	ptFeeTags: string[] = [];
	proFeeTags: string[] = [];

	private subscriptions: Subscription[] = [];
	readonly separatorKeysCodes: number[] = [ENTER, COMMA];

	constructor(public dialogRef: MatDialogRef<AddFeeToServiceDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: ProfessionalConnectedServicesModel,
		private professionalService: ProfessionalsService,
		private spinner: NgxSpinnerService,
		private layoutUtilsService: LayoutUtilsService,
		private feeFB: FormBuilder,
		private staticService: StaticDataService,
		private cdr: ChangeDetectorRef) {
	}

	ngOnInit() {

		const optionChange = this.feeOption.valueChanges.subscribe((value) => {
			if (this.feeForm) {
				this.updateForm(parseInt(value));
			}
		});
		this.subscriptions.push(optionChange);

		this.loadDialogData();
	}

	loadDialogData() {
		this.viewLoading = true;
		this.professionalService.getProfessionalServiceDetail(this.data.ptFeeRowId, this.data.proFeeRowId).toPromise().then((resp) => {
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
			ptFeeName: [this.feeDiagModel.ptFeeName, Validators.required],
			ptFeeA1: [this.feeDiagModel.ptFeeA1, Validators.required],
			ptFeeA2: [this.feeDiagModel.ptFeeA2, Validators.required],
			ptFeeTags: [this.feeDiagModel.ptFeeTags],

			proFeeId: [this.feeDiagModel.proFeeId, Validators.required],
			proFeeName: [this.feeDiagModel.proFeeName, Validators.required],
			proFeeA1: [this.feeDiagModel.proFeeA1, Validators.required],
			proFeeA2: [this.feeDiagModel.proFeeA2, Validators.required],
			proFeeTags: [this.feeDiagModel.proFeeTags],
		});
		this.updateForm(0);
		this.loadPTFeesForFilter();
	}

	updateForm(value: number) {
		if (value === 0) {
			this.feeForm.get('ptFeeName').disable();
			this.feeForm.get('ptFeeA1').disable();
			this.feeForm.get('ptFeeA2').disable();

			this.feeForm.get('proFeeName').disable();
			this.feeForm.get('proFeeA1').disable();
			this.feeForm.get('proFeeA2').disable();

			this.feeForm.get('ptFeeId').enable();
			this.feeForm.get('proFeeId').enable();
		} else {
			this.feeForm.get('ptFeeName').enable();
			this.feeForm.get('ptFeeA1').enable();
			this.feeForm.get('ptFeeA2').enable();

			this.feeForm.get('proFeeName').enable();
			this.feeForm.get('proFeeA1').enable();
			this.feeForm.get('proFeeA2').enable();

			this.feeForm.get('ptFeeId').disable();
			this.feeForm.get('proFeeId').disable();
		}
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
		this.professionalService.saveProfessionalServiceFee(this.prepareFee(), this.data.ptFeeRowId, this.data.proFeeRowId).toPromise().then((res) => {
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
		var option = parseInt(this.feeOption.value);

		const controls = this.feeForm.controls;
		const _fee = new FeeDialogModel();
		_fee.serviceId = this.data.serviceId;
		_fee.professionalId = this.data.professionalId;
		_fee.ptFeeRowId = this.data.ptFeeRowId;
		_fee.proFeeRowId = this.data.proFeeRowId;

		if (option === 0 && controls.ptFeeId.value)
			_fee.ptFeeId = +controls.ptFeeId.value.id;

		_fee.ptFeeName = controls.ptFeeName.value;
		_fee.ptFeeA1 = controls.ptFeeA1.value;
		_fee.ptFeeA2 = controls.ptFeeA2.value;

		if (option === 0 && controls.proFeeId.value)
			_fee.proFeeId = +controls.proFeeId.value.id;
		_fee.proFeeName = controls.proFeeName.value;
		_fee.proFeeA1 = controls.proFeeA1.value;
		_fee.proFeeA2 = controls.proFeeA2.value;

		if (this.ptFeeTags && this.ptFeeTags.length > 0)
			_fee.ptFeeTags = this.ptFeeTags.join(',');

		if (this.proFeeTags && this.proFeeTags.length > 0)
			_fee.proFeeTags = this.proFeeTags.join(',');

		return _fee;
	}

	ngOnDestroy(): void {
		this.subscriptions.forEach(el => el.unsubscribe());
	}


	// PT Fees Filter
	loadPTFeesForFilter() {
		this.viewLoading = true;
		this.professionalService.getFeesForFilter(this.data.ptFeeRowId, this.data.proFeeRowId).toPromise().then(res => {
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

	addPtTag(event: MatChipInputEvent): void {
		const input = event.input;
		const value = event.value;

		// Add our fruit
		if (this.ptFeeTags.length < 5 && (value || '').trim()) {
			this.ptFeeTags.push(value.trim());
		}

		// Reset the input value
		if (input) {
			input.value = '';
		}
	}

	addProTag(event: MatChipInputEvent): void {
		const input = event.input;
		const value = event.value;

		// Add our fruit
		if (this.proFeeTags.length < 5 && (value || '').trim()) {
			this.proFeeTags.push(value.trim());
		}

		// Reset the input value
		if (input) {
			input.value = '';
		}
	}

	removePtTag(tag: string): void {
		const index = this.ptFeeTags.indexOf(tag);

		if (index >= 0) {
			this.ptFeeTags.splice(index, 1);
		}
	}

	removeProTag(tag: string): void {
		const index = this.proFeeTags.indexOf(tag);

		if (index >= 0) {
			this.proFeeTags.splice(index, 1);
		}
	}

	detectChanges() {
		try {
			this.cdr.detectChanges();
		} catch{

		}
	}
}
