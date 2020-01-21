import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialog, MatChipInputEvent, MatSelect, MatTabChangeEvent } from '@angular/material';
import { Observable, BehaviorSubject, Subscription, of, ReplaySubject, Subject } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../../core/reducers';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { FeeModel, FilterModel, selectFeeById, FeesService, StaticDataService, ApiResponse } from '../../../../../core/medelit';
import { TypesUtilsService, LayoutUtilsService, MessageType } from '../../../../../core/_base/crud';
import { SubheaderService, LayoutConfigService } from '../../../../../core/_base/layout';
import { NgxSpinnerService } from 'ngx-spinner';
import * as _ from 'lodash';

export interface Fruit {
	name: string;
}

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-fee-edit',
	templateUrl: './fee-edit.component.html',
	styleUrls: ['./fee-edit.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeeEditComponent implements OnInit, OnDestroy {
	// tags input
	visible = true;
	selectable = true;
	removable = true;
	addOnBlur = true;
	readonly separatorKeysCodes: number[] = [ENTER, COMMA];

	feeId: number = 0;
	// Public properties
	fee: FeeModel;
	feeId$: Observable<number>;
	oldFee: FeeModel;
	selectedTab = 0;
	tabTitle: string = '';
	loadingSubject = new BehaviorSubject<boolean>(true);
	loading$: Observable<boolean>;
	feeForm: FormGroup;
	hasFormErrors = false;

	private componentSubscriptions: Subscription;
	private headerMargin: number;
	protected _onDestroy = new Subject<void>();

	tagsArray: string[];

	constructor(
		private store: Store<AppState>,
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private typesUtilsFee: TypesUtilsService,
		private feeFB: FormBuilder,
		public dialog: MatDialog,
		private subheaderFee: SubheaderService,
		private layoutUtilsFee: LayoutUtilsService,
		private layoutConfigFee: LayoutConfigService,
		private feeFee: FeesService,
		private staticFee: StaticDataService,
		private spinner: NgxSpinnerService,
		private cdr: ChangeDetectorRef) {
	}

	ngOnInit() {
		this.loading$ = this.loadingSubject.asObservable();
		this.loadingSubject.next(true);
		this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id && id > 0) {
				this.feeId = id;
				this.store.pipe(
					select(selectFeeById(id))
				).subscribe(result => {
					//if (!result) {
					this.loadFeeFromFee(id);
					return;
					//}

					//this.loadFee(result);
				});
			} else {
				const newFee = new FeeModel();
				newFee.clear();
				this.loadFee(newFee);
			}
		});

		window.onload = () => {
			const style = getComputedStyle(document.getElementById('kt_header'));
			this.headerMargin = parseInt(style.height, 0);
		};
	}

	loadFee(_fee, fromFee: boolean = false) {
		if (!_fee) {
			this.goBack('');
		}
		this.fee = _fee;
		this.feeId$ = of(_fee.id);
		this.oldFee = Object.assign({}, _fee);
		this.initFee();

		if (fromFee) {
			this.cdr.detectChanges();
		}
	}

	loadFeeFromFee(feeId) {
		this.spinner.show();
		this.feeFee.getFeeById(feeId).toPromise().then(res => {
			this.loadFee((res as unknown as ApiResponse).data, true);
		}).catch(() => {
			this.spinner.hide();
		}).finally(() => {
			this.spinner.hide();
		});
	}

	ngOnDestroy() {
		if (this.componentSubscriptions) {
			this.componentSubscriptions.unsubscribe();
		}
	}

	initFee() {
		this.createForm();
		this.loadingSubject.next(false);
		if (!this.fee.id) {
			this.subheaderFee.setBreadcrumbs([
				{ title: 'Fee', page: `/fee-management` },
				{ title: 'Fees', page: `/fee-management/fees` },
				{ title: 'Create fee', page: `/fee-management/fees/add` }
			]);
			return;
		}
		this.subheaderFee.setTitle('Edit fee');
		this.subheaderFee.setBreadcrumbs([
			{ title: 'Fee Management', page: `/fee-management` },
			{ title: 'Fees', page: `/fee-management/fees` },
			{ title: 'Edit fee', page: `/fee-management/servies/edit`, queryParams: { id: this.fee.id } }
		]);
	}

	createForm() {

		this.feeForm = this.feeFB.group({
			feeTypeId: [this.fee.feeTypeId.toString(), Validators.required],
			feeName: [this.fee.feeName, Validators.required],
			a1: [this.fee.a1, [Validators.required, Validators.min(1)]],
			a2: [this.fee.a2, [Validators.required, Validators.min(1)]],
			tags: [this.fee.tags, []]
		});
		if (this.fee.tags) {
			this.tagsArray = this.fee.tags.split(',');
			this.feeForm.get('tags').setValue('');
		}
		else {
			this.tagsArray = [];
		}
	}

	goBack(id) {
		this.loadingSubject.next(false);
		const url = `/fee-management/fees?id=${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	goBackWithoutId() {
		this.router.navigateByUrl('/fee-management/fees', { relativeTo: this.activatedRoute });
	}

	refreshFee(isNew: boolean = false, id = 0) {
		this.loadingSubject.next(false);
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/fee-management/fees/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	reset() {
		this.fee = Object.assign({}, this.oldFee);
		this.createForm();
		this.hasFormErrors = false;
		this.feeForm.markAsPristine();
		this.feeForm.markAsUntouched();
		this.feeForm.updateValueAndValidity();
	}

	onSumbit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.feeForm.controls;
		/** check form */
		if (this.feeForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			window.scroll(0, 0);
			return;
		}

		// tslint:disable-next-line:prefer-const
		let editedFee = this.prepareFee();

		if (editedFee.id > 0) {
			this.updateFee(editedFee, withBack);
			return;
		}

		this.addFee(editedFee, withBack);
	}

	prepareFee(): FeeModel {
		const controls = this.feeForm.controls;
		const _fee = new FeeModel();
		_fee.id = this.fee.id;
		_fee.feeTypeId = +controls.feeTypeId.value
		_fee.feeCode = this.fee.feeCode;
		_fee.feeName = controls.feeName.value;
		_fee.a1 = controls.a1.value;
		_fee.a2 = controls.a2.value;
		if (this.tagsArray.length > 0)
			_fee.tags = this.tagsArray.join(',');
		_fee.feeTypeId = +controls.feeTypeId.value;
		return _fee;
	}

	addFee(_fee: FeeModel, withBack: boolean = false) {
		this.spinner.show();
		this.feeFee.createFee(_fee).toPromise().then((res) => {
			this.loadingSubject.next(false);
			var resp = res as unknown as ApiResponse;
			if (resp.success && resp.data.id > 0) {
				if (withBack)
					this.goBack(resp.data.id);
				else {
					const message = `New fee successfully has been added.`;
					this.layoutUtilsFee.showActionNotification(message, MessageType.Create, 10000, true, true);
					this.refreshFee(true, resp.data.id);
				}
			} else {
				const message = _.join(resp.errors.join('<br/>'));
				this.layoutUtilsFee.showActionNotification(message, MessageType.Read, 10000, true, true);
			}
		}).catch(() => {
			this.spinner.hide();
			const message = `An error occured while processing your reques. Please try again later.`;
			this.layoutUtilsFee.showActionNotification(message, MessageType.Read, 10000, true, true);
		}).finally(() => {
			this.spinner.hide();
		});

	}

	updateFee(_fee: FeeModel, withBack: boolean = false) {
		this.spinner.show();
		this.feeFee.createFee(_fee).toPromise().then((res) => {
			this.loadingSubject.next(false);
			var resp = res as unknown as ApiResponse;
			if (resp.success && resp.data.id > 0) {
				const message = `update fee request processed succefully`;
				this.layoutUtilsFee.showActionNotification(message, MessageType.Update, 10000, true, true);
				this.refreshFee(false);
			} else {
				const message = `An error occured while processing your reques. Please try again later.`;
				this.layoutUtilsFee.showActionNotification(message, MessageType.Read, 10000, true, true);
			}
		}).catch(() => {
			this.spinner.hide();
		}).finally(() => {
			this.spinner.hide();
		});;

	}

	getComponentTitle() {
		let result = 'Create fee';
		if (this.selectedTab == 0) {

			if (!this.fee || !this.fee.id) {
				return result;
			}
			result = `Edit Fee - ${this.fee.feeName}`;
		}
		else {
			result = this.tabTitle;
		}
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

	/*fitlers aread*/

	add(event: MatChipInputEvent): void {
		const input = event.input;
		const value = event.value;

		// Add our fruit
		if (this.tagsArray.length < 5 && (value || '').trim()) {
			this.tagsArray.push(value.trim());
		}

		// Reset the input value
		if (input) {
			input.value = '';
		}
	}

	remove(tag: string): void {
		const index = this.tagsArray.indexOf(tag);

		if (index >= 0) {
			this.tagsArray.splice(index, 1);
		}
	}

	tabChanged(event: MatTabChangeEvent) {
		this.tabTitle = event.tab.textLabel;
	}

}
