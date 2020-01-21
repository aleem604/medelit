// Angular
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
// Material
import { MatDialog, MatChipInputEvent, MatSelect, MatTabChangeEvent } from '@angular/material';
// RxJS
import { Observable, BehaviorSubject, Subscription, of, ReplaySubject, Subject } from 'rxjs';
import { map, startWith, delay, first, takeUntil } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
import { Dictionary, Update } from '@ngrx/entity';
import { AppState } from '../../../../../core/reducers';
// Layout
import { SubheaderService, LayoutConfigService } from '../../../../../core/_base/layout';
// CRUD
import { LayoutUtilsService, TypesUtilsService, MessageType } from '../../../../../core/_base/crud';
// Services and Models
import {
	selectLastCreatedServiceId,
	selectServiceById,
	SPECIFICATIONS_DICTIONARY,
	ServiceModel,
	ServiceOnServerCreated,
	ServiceUpdated,
	ServicesService,
	FilterModel,
	StaticDataService,
	ApiResponse,
} from '../../../../../core/medelit';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { NgxSpinnerService } from 'ngx-spinner';

export interface Fruit {
	name: string;
}

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-service-edit',
	templateUrl: './service-edit.component.html',
	styleUrls: ['./service-edit.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceEditComponent implements OnInit, OnDestroy {
	// tags input
	visible = true;
	selectable = true;
	removable = true;
	addOnBlur = true;
	readonly separatorKeysCodes: number[] = [ENTER, COMMA];

	// Public properties
	service: ServiceModel;
	serviceId: number;
	serviceId$: Observable<number>;
	oldService: ServiceModel;
	selectedTab = 0;
	tabTitle: string = '';
	loadingSubject = new BehaviorSubject<boolean>(true);
	loading$: Observable<boolean>;
	serviceForm: FormGroup;
	hasFormErrors = false;

	private componentSubscriptions: Subscription;
	private headerMargin: number;

	fieldsForFilter: FilterModel[] = [];
	filteredFields: Observable<FilterModel[]>;

	categoriesForFilter: FilterModel[] = [];
	filteredCategories: Observable<FilterModel[]>;

	durationsForFilter: FilterModel[] = [];
	filteredDurations: Observable<FilterModel[]>;

	vatsForFilter: FilterModel[] = [];
	filteredVats: Observable<FilterModel[]>;

	ptFeesForFilter: FilterModel[] = [];
	filteredPTFees: Observable<FilterModel[]>;

	proFeesForFilter: FilterModel[] = [];
	filteredPROFees: Observable<FilterModel[]>;

	professionalsForFilter: FilterModel[] = [];
	filteredProfessionals: ReplaySubject<FilterModel[]> = new ReplaySubject<FilterModel[]>(1);
	public profMultiCtrl: FormControl = new FormControl();
	public profMultiFilterCtrl: FormControl = new FormControl();
	public filteredLangsMulti: ReplaySubject<FilterModel[]> = new ReplaySubject<FilterModel[]>(1);
	@ViewChild('multiSelect', { static: true }) multiSelect: MatSelect;
	protected _onDestroy = new Subject<void>();

	tagsArray: string[];

	constructor(
		private store: Store<AppState>,
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private typesUtilsService: TypesUtilsService,
		private serviceFB: FormBuilder,
		public dialog: MatDialog,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private layoutConfigService: LayoutConfigService,
		private serviceService: ServicesService,
		private staticService: StaticDataService,
		private spinner: NgxSpinnerService,
		private cdr: ChangeDetectorRef) {
	}

	ngOnInit() {
		this.loading$ = this.loadingSubject.asObservable();
		this.loadingSubject.next(true);
		this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id && id > 0) {
				this.serviceId = id;
				this.store.pipe(
					select(selectServiceById(id))
				).subscribe(result => {
					//if (!result) {
					this.loadServiceFromService(id);
					return;
					//}

					//this.loadService(result);
				});
			} else {
				const newService = new ServiceModel();
				newService.clear();
				this.loadService(newService);
			}
		});

		window.onload = () => {
			const style = getComputedStyle(document.getElementById('kt_header'));
			this.headerMargin = parseInt(style.height, 0);
		};
	}

	loadService(_service, fromService: boolean = false) {
		if (!_service) {
			this.goBack('');
		}
		this.service = _service;
		this.serviceId$ = of(_service.id);
		this.oldService = Object.assign({}, _service);
		this.initService();
		this.loadFieldsForFilter();
		this.loadCategoriesForFilter();
		this.loadDurationsForFilter();
		this.loadVatsForFilter();
		this.loadPTFeesForFilter();
		this.loadPROFeesForFilter();
		this.loadProfessionalsForFilter();

		if (fromService) {
			this.cdr.detectChanges();
		}
	}

	loadServiceFromService(serviceId) {
		this.spinner.show();
		this.serviceService.getServiceById(serviceId).toPromise().then(res => {
			this.loadService((res as unknown as ApiResponse).data, true);
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

	initService() {
		this.createForm();
		this.loadingSubject.next(false);
		if (!this.service.id) {
			this.subheaderService.setBreadcrumbs([
				{ title: 'Service', page: `/service-management` },
				{ title: 'Services', page: `/service-management/services` },
				{ title: 'Create service', page: `/service-management/services/add` }
			]);
			return;
		}
		this.subheaderService.setTitle('Edit servie');
		this.subheaderService.setBreadcrumbs([
			{ title: 'Service Management', page: `/service-management` },
			{ title: 'Services', page: `/service-management/services` },
			{ title: 'Edit service', page: `/service-management/servies/edit`, queryParams: { id: this.service.id } }
		]);
	}

	createForm() {

		this.serviceForm = this.serviceFB.group({
			name: [this.service.name, Validators.required],
			cycleId: [this.service.cycleId.toString(), Validators.required],
			activeServiceId: [this.service.activeServiceId.toString(), Validators.required],
			timedServiceId: [this.service.timedServiceId.toString(), [Validators.required]],
			contractedServiceId: [this.service.contractedServiceId.toString(), []],
			informedConsentId: [this.service.informedConsentId.toString(), []],

			fieldId: [this.service.fieldId, [Validators.required]],
			subcategoryId: [this.service.subcategoryId, [Validators.required]],
			tags: [this.service.tags, []],
			description: [this.service.description, []],
			durationId: [this.service.durationId, [Validators.required]],
			vatId: [this.service.vatId, [Validators.required]],
			ptFeeId: [this.service.ptFeeId, [Validators.required]],
			ptFeeA1: [this.service.ptFeeA1],
			ptFeeA2: [this.service.ptFeeA2],
			proFeeId: [this.service.proFeeId, [Validators.required]],
			proFeeA1: [this.service.proFeeA1],
			proFeeA2: [this.service.proFeeA2],

			covermap: [this.service.covermap, []],
			invoicingNotes: [this.service.invoicingNotes, []],
			refundNotes: [this.service.refundNotes, []],
			professionals: [this.service.professionals, [Validators.required]]
		});
		if (this.service.tags) {
			this.tagsArray = this.service.tags.split(',');
			this.serviceForm.get('tags').setValue('');
		}
		else {
			this.tagsArray = [];
		}

	}


	goBack(id) {
		this.loadingSubject.next(false);
		const url = `/service-management/services?id=${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	goBackWithoutId() {
		this.router.navigateByUrl('/service-management/services', { relativeTo: this.activatedRoute });
	}

	refreshService(isNew: boolean = false, id = 0) {
		this.loadingSubject.next(false);
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/service-management/services/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	reset() {
		this.service = Object.assign({}, this.oldService);
		this.createForm();
		this.hasFormErrors = false;
		this.serviceForm.markAsPristine();
		this.serviceForm.markAsUntouched();
		this.serviceForm.updateValueAndValidity();
	}

	onSumbit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.serviceForm.controls;
		/** check form */
		if (this.serviceForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			window.scroll(0, 0);
			return;
		}

		// tslint:disable-next-line:prefer-const
		let editedService = this.prepareService();

		if (editedService.id > 0) {
			this.updateService(editedService, withBack);
			return;
		}

		this.addService(editedService, withBack);
	}

	prepareService(): ServiceModel {
		const controls = this.serviceForm.controls;
		const _service = new ServiceModel();
		_service.id = this.service.id;
		_service.name = controls.name.value;
		_service.cycleId = controls.cycleId.value;
		_service.activeServiceId = controls.activeServiceId.value;
		_service.timedServiceId = controls.timedServiceId.value;
		_service.contractedServiceId = controls.contractedServiceId.value;
		_service.informedConsentId = controls.informedConsentId.value;
		if (controls.fieldId.value)
			_service.fieldId = controls.fieldId.value.id;
		if (controls.subcategoryId.value)
			_service.subcategoryId = controls.subcategoryId.value.id;

		if (this.tagsArray.length > 0)
			_service.tags = this.tagsArray.join(',');
		_service.description = controls.description.value;
		if (controls.durationId.value)
			_service.durationId = controls.durationId.value.id;

		if (controls.vatId.value)
			_service.vatId = controls.vatId.value.id;
		if (controls.ptFeeId.value)
			_service.ptFeeId = controls.ptFeeId.value.id;
		if (controls.proFeeId.value)
			_service.proFeeId = controls.proFeeId.value.id;
		_service.covermap = controls.covermap.value;
		_service.invoicingNotes = controls.invoicingNotes.value;
		_service.refundNotes = controls.refundNotes.value;
		_service.professionals = controls.professionals.value;

		return _service;
	}

	addService(_service: ServiceModel, withBack: boolean = false) {
		this.spinner.show();
		this.serviceService.createService(_service).toPromise().then((res) => {
			this.loadingSubject.next(false);
			var resp = res as unknown as ApiResponse;
			if (resp.success && resp.data.id > 0) {
				if (withBack)
					this.goBack(resp.data.id);
				else {
					const message = `New service successfully has been added.`;
					this.layoutUtilsService.showActionNotification(message, MessageType.Create, 10000, true, true);
					this.refreshService(true, resp.data.id);
				}
			} else {
				const message = `An error occured while processing your reques. Please try again later.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Read, 10000, true, true);
			}
		}).catch(() => {
			this.spinner.hide();
		}).finally(() => {
			this.spinner.hide();
		});





		//this.loadingSubject.next(true);
		//this.store.dispatch(new ServiceOnServerCreated({ service: _service }));
		//this.componentSubscriptions = this.store.pipe(
		//	delay(1000),
		//	select(selectLastCreatedServiceId)
		//).subscribe(newId => {
		//	if (!newId) {
		//		return;
		//	}

		//	this.loadingSubject.next(false);
		//	if (withBack) {
		//		this.goBack(newId);
		//	} else {
		//		const message = `New service successfully has been added.`;
		//		this.layoutUtilsService.showActionNotification(message, MessageType.Create, 10000, true, true);
		//		this.refreshService(true, newId);
		//	}
		//});
	}

	updateService(_service: ServiceModel, withBack: boolean = false) {
		this.spinner.show();
		this.serviceService.createService(_service).toPromise().then((res) => {
			this.loadingSubject.next(false);
			var resp = res as unknown as ApiResponse;
			if (resp.success && resp.data.id > 0) {
				const message = `New service successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 10000, true, true);
				this.refreshService(false);
			} else {
				const message = `An error occured while processing your reques. Please try again later.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Read, 10000, true, true);
			}
		}).catch(() => {
			this.spinner.hide();
		}).finally(() => {
			this.spinner.hide();
		});;




		//this.loadingSubject.next(true);

		//const updateService: Update<ServiceModel> = {
		//	id: _service.id,
		//	changes: _service
		//};

		//this.store.dispatch(new ServiceUpdated({
		//	partialService: updateService,
		//	service: _service
		//}));

		//of(undefined).pipe(delay(3000)).subscribe(() => { // Remove this line
		//	if (withBack) {
		//		this.goBack(_service.id);
		//	} else {
		//		const message = `Service successfully has been saved.`;
		//		this.layoutUtilsService.showActionNotification(message, MessageType.Update, 10000, true, true);
		//		this.refreshService(false);
		//	}
		//});
	}

	getComponentTitle() {
		let result = 'Create service';
		if (this.selectedTab == 0) {
			if (!this.service || !this.service.id) {
				return result;
			}
			result = `Edit service - ${this.service.serviceCode} ${this.service.name}`;
		} else {
			result = this.tabTitle;
		}
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

	/*fitlers aread*/
	// Field Filter
	loadFieldsForFilter() {
		this.staticService.getFieldsForFilter().subscribe(res => {
			this.fieldsForFilter = res.data;

			this.filteredFields = this.serviceForm.get('fieldId').valueChanges
				.pipe(
					startWith(''),
					map(value => this._filterTitles(value))
				);
			if (this.service.fieldId > 0) {
				var title = this.fieldsForFilter.find(x => x.id == this.service.fieldId);
				if (title) {
					this.serviceForm.patchValue({ 'fieldId': { id: title.id, value: title.value } });
				}
			}
		});

	}
	private _filterTitles(value: string): FilterModel[] {
		const filterValue = this._normalizeValue(value);
		return this.fieldsForFilter.filter(elem => this._normalizeValue(elem.value).includes(filterValue));
	}
	/// End Field Filter

	// Categories Filter
	loadCategoriesForFilter() {
		this.staticService.getCategoriesForFilter().subscribe(res => {
			this.categoriesForFilter = res.data;

			this.filteredCategories = this.serviceForm.get('subcategoryId').valueChanges
				.pipe(
					startWith(''),
					map(value => this._filterCategories(value))
				);
			if (this.service.subcategoryId > 0) {
				var title = this.categoriesForFilter.find(x => x.id == this.service.subcategoryId);
				if (title) {
					this.serviceForm.patchValue({ 'subcategoryId': { id: title.id, value: title.value } });
				}
			}
		});
	}
	private _filterCategories(value: string): FilterModel[] {
		const filterValue = this._normalizeValue(value);
		return this.categoriesForFilter.filter(elem => this._normalizeValue(elem.value).includes(filterValue));
	}
	/// End Categories Filter

	// Tags

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



	// End Tags




	// Categories Filter
	loadDurationsForFilter() {
		this.staticService.getDurationsForFilter().subscribe(res => {
			this.durationsForFilter = res.data;

			this.filteredDurations = this.serviceForm.get('durationId').valueChanges
				.pipe(
					startWith(''),
					map(value => this._filterDurations(value))
				);
			if (this.service.durationId > 0) {
				var title = this.durationsForFilter.find(x => x.id == this.service.durationId);
				if (title) {
					this.serviceForm.patchValue({ 'durationId': { id: title.id, value: title.value } });
				}
			}
		});
	}
	private _filterDurations(value: string): FilterModel[] {
		const filterValue = this._normalizeValue(value);
		return this.durationsForFilter.filter(elem => this._normalizeValue(elem.value).includes(filterValue));
	}
	/// End Categories Filter

	// Vat Filter
	loadVatsForFilter() {
		this.staticService.getVatsForFilter().subscribe(res => {
			this.vatsForFilter = res.data;

			this.filteredVats = this.serviceForm.get('vatId').valueChanges
				.pipe(
					startWith(''),
					map(value => this._filterVats(value))
				);
			if (this.service.vatId > 0) {
				var vat = this.vatsForFilter.find(x => x.id == this.service.vatId);
				if (vat) {
					this.serviceForm.patchValue({ 'vatId': { id: vat.id, value: vat.value } });
				}
			}
		});
	}
	private _filterVats(value: string): FilterModel[] {
		const filterValue = this._normalizeValue(value);
		return this.vatsForFilter.filter(elem => this._normalizeValue(elem.value).includes(filterValue));
	}
	/// End vat Filter

	// Professionals Filter
	loadProfessionalsForFilter() {
		this.staticService.getProfessionalsForFilter().subscribe(res => {
			this.professionalsForFilter = res.data;
			this.filteredProfessionals.next(this.professionalsForFilter.slice());

			if (this.service.id) {
				var profs = this.service.professionals as unknown as FilterModel[];
				var select: FilterModel[] = [];
				profs && profs.forEach((x) => {
					var findIndex = this.professionalsForFilter.findIndex((el) => { return el.id == x.id });
					if (findIndex > -1)
						select.push(this.professionalsForFilter[findIndex]);

				});
				this.serviceForm.patchValue({ 'professionals': select });
			}


			this.profMultiFilterCtrl.valueChanges
				.pipe(takeUntil(this._onDestroy))
				.subscribe(() => {
					this.filterLangsMulti();
				});
		});
	}

	private filterLangsMulti() {
		if (!this.professionalsForFilter) {
			return;
		}
		// get the search keyword
		let search = this.profMultiFilterCtrl.value;
		if (!search) {
			this.filteredProfessionals.next(this.professionalsForFilter.slice());
			return;
		} else {
			search = search.toLowerCase();
		}
		// filter the banks
		this.filteredProfessionals.next(
			this.professionalsForFilter.filter(bank => bank.value.toLowerCase().indexOf(search) > -1)
		);
	}
	// end professionals fitler


	// PT Fees Filter
	loadPTFeesForFilter() {
		this.staticService.getPTFeesForFilter().subscribe(res => {
			this.ptFeesForFilter = res.data;

			this.filteredPTFees = this.serviceForm.get('ptFeeId').valueChanges
				.pipe(
					startWith(''),
					map(value => this._filterPTFees(value))
				);
			if (this.service.ptFeeId > 0) {
				var vat = this.ptFeesForFilter.find(x => x.id == this.service.ptFeeId);
				if (vat) {
					// @ts-ignore
					this.serviceForm.patchValue({ 'ptFeeId': { id: vat.id, value: vat.value, a1: vat.a1, a2: vat.a2 } });
				}
				this.ptFeeDrpClosed();
			}
		});
	}
	private _filterPTFees(value: string): FilterModel[] {
		const filterValue = this._normalizeValue(value);
		return this.ptFeesForFilter.filter(elem => this._normalizeValue(elem.value).includes(filterValue));
	}
	ptFeeDrpClosed() {
		var selected = this.serviceForm.get('ptFeeId').value;
		if (selected) {
			this.serviceForm.get('ptFeeA1').setValue(selected.a1);
			this.serviceForm.get('ptFeeA2').setValue(selected.a2);
		} else {
			this.serviceForm.get('ptFeeA1').setValue('');
			this.serviceForm.get('ptFeeA2').setValue('');
		}
	}

	/// End PT Fees for filter

	// PRO Fees Filter
	loadPROFeesForFilter() {
		this.staticService.getPROFeesForFilter().subscribe(res => {
			this.proFeesForFilter = res.data;

			this.filteredPROFees = this.serviceForm.get('proFeeId').valueChanges
				.pipe(
					startWith(''),
					map(value => this._filterPROFees(value))
				);
			if (this.service.vatId > 0) {
				var vat = this.proFeesForFilter.find(x => x.id == this.service.proFeeId);
				if (vat) {
					// @ts-ignore
					this.serviceForm.patchValue({ 'proFeeId': { id: vat.id, value: vat.value, a1: vat.a1, a2: vat.a2 } });
				}
				this.proFeeDrpClosed();
			}
		});
	}
	private _filterPROFees(value: string): FilterModel[] {
		const filterValue = this._normalizeValue(value);
		return this.proFeesForFilter.filter(elem => this._normalizeValue(elem.value).includes(filterValue));
	}

	proFeeDrpClosed() {
		var selected = this.serviceForm.get('proFeeId').value;
		if (selected) {
			this.serviceForm.get('proFeeA1').setValue(selected.a1);
			this.serviceForm.get('proFeeA2').setValue(selected.a2);
		} else {
			this.serviceForm.get('proFeeA1').setValue('');
			this.serviceForm.get('proFeeA2').setValue('');
		}
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
	// End Fitler Section
	tabChanged(event: MatTabChangeEvent) {
		this.tabTitle = event.tab.textLabel;
	}


	//// fee section
	createFee(feeType: number) {
		console.log(feeType);
	}


}
