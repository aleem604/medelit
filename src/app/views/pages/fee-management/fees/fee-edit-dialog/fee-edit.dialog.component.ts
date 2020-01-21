// Angular
import { Component, OnInit, Inject, ChangeDetectionStrategy, ViewEncapsulation, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// Material
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
// RxJS
import { Subscription, of } from 'rxjs';
import { delay } from 'rxjs/operators';
// NGRX
import { Update } from '@ngrx/entity';
import { Store, select } from '@ngrx/store';
// State
import { AppState } from '../../../../../core/reducers';
// CRUD
import { TypesUtilsService } from '../../../../../core/_base/crud';
// Services and Models
import { FeeModel, FeeUpdated, FeeOnServerCreated, selectLastCreatedFeeId, selectFeesPageLoading, selectFeesActionLoading } from '../../../../../core/medelit';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-fee-edit-dialog',
	templateUrl: './fee-edit.dialog.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class FeeEditDialogComponent implements OnInit, OnDestroy {
	// Public properties
	fee: FeeModel;
	feeForm: FormGroup;
	hasFormErrors = false;
	viewLoading = false;
	// Private properties
	private componentSubscriptions: Subscription;

	constructor(public dialogRef: MatDialogRef<FeeEditDialogComponent>,
		           @Inject(MAT_DIALOG_DATA) public data: any,
		           private fb: FormBuilder,
		           private store: Store<AppState>,
		           private typesUtilsService: TypesUtilsService) {
	}

	ngOnInit() {
		this.store.pipe(select(selectFeesActionLoading)).subscribe(res => this.viewLoading = res);
		this.fee = this.data.fee;
		this.createForm();
	}

	ngOnDestroy() {
		if (this.componentSubscriptions) {
			this.componentSubscriptions.unsubscribe();
		}
	}

	createForm() {
		
		this.feeForm = this.fb.group({
			feeName: [this.fee.feeName, Validators.required],
			tags: [this.fee.tags],		
			feeTypeId: [this.fee.feeTypeId.toString(), Validators.compose([Validators.required])],
			a1: [this.fee.a1, Validators.compose([Validators.required, Validators.maxLength(5)])],
			a2: [this.fee.a2, Validators.compose([Validators.required, Validators.maxLength(5)])]
		});
	}

	getTitle(): string {
		if (this.fee.id > 0) {
			return `Edit fee '${this.fee.feeCode} ${this.fee.feeName}'`;
		}

		return 'New fee';
	}

	isControlInvalid(controlName: string): boolean {
		const control = this.feeForm.controls[controlName];
		const result = control.invalid && control.touched;
		return result;
	}

	prepareFee(): FeeModel {
		const controls = this.feeForm.controls;
		const _fee = new FeeModel();
		_fee.id = this.fee.id;
		_fee.feeCode = this.fee.feeCode;
		
		_fee.feeName = controls.feeName.value;
		_fee.a1 = controls.a1.value;
		_fee.a2 = controls.a2.value;
		_fee.feeTypeId = +controls.feeTypeId.value;
		return _fee;
	}

	onSubmit() {
		this.hasFormErrors = false;
		const controls = this.feeForm.controls;
		/** check form */
		if (this.feeForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			return;
		}

		const editedFee = this.prepareFee();
		if (editedFee.id > 0) {
			this.updateFee(editedFee);
		} else {
			this.createFee(editedFee);
		}
	}

	updateFee(_fee: FeeModel) {
		const updateFee: Update<FeeModel> = {
			id: _fee.id,
			changes: _fee
		};
		this.store.dispatch(new FeeUpdated({
			partialFee: updateFee,
			fee: _fee
		}));

		// Remove this line
		of(undefined).pipe(delay(5000)).subscribe(() => this.dialogRef.close({ _fee, isEdit: true }));
		// Uncomment this line
		// this.dialogRef.close({ _fee, isEdit: true }
	}

	createFee(_fee: FeeModel) {
		this.store.dispatch(new FeeOnServerCreated({ fee: _fee }));
		this.componentSubscriptions = this.store.pipe(
			select(selectLastCreatedFeeId),
			delay(2000), // Remove this line
		).subscribe(res => {
			//if (!res) {
			//	return;
			//}

			this.dialogRef.close({ _fee, isEdit: false });
		});
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}
}
