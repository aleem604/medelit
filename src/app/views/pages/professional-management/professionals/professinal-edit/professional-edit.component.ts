import { Update } from '@ngrx/entity';
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialog, MatTabChangeEvent } from '@angular/material';
import { Observable, BehaviorSubject, Subscription, of, Subject, ReplaySubject } from 'rxjs';
import { map, startWith, takeUntil } from 'rxjs/operators';
import * as _ from 'lodash';
import { Store } from '@ngrx/store';
import { AppState } from '../../../../../core/reducers';
import { SubheaderService, LayoutConfigService } from '../../../../../core/_base/layout';
import { LayoutUtilsService, TypesUtilsService, MessageType } from '../../../../../core/_base/crud';
// Services and Models
import {
	ProfessionalModel,
	ProfessionalsService,
	FilterModel,
	StaticDataService,
	ApiResponse,
	MedelitStaticData,
	ServicesService
} from '../../../../../core/medelit';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { NgxSpinnerService } from 'ngx-spinner';
import { ConfirmDialogComponent } from '../../../../partials/confirm-dialog/confirm-dialog.component';
import { AttachServiceToProDialogComponent } from '../attach-service-to-pro-dialog/attach-service-to-pro.dialog.component';
import { MedelitConstants } from '../../../../../core/_base/constants/medelit-contstants';
import { MedelitBaseComponent } from '../../../../../core/_base/components/medelit-base.component';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-professional-edit',
	templateUrl: './professional-edit.component.html',
	styleUrls: ['./professional-edit.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfessionalEditComponent extends MedelitBaseComponent implements OnInit, OnDestroy {
	proId: number;
	visible = true;
	selectable = true;
	removable = true;
	addOnBlur = true;
	separatorKeysCodes: number[] = [ENTER, COMMA];

	// Public properties
	professional: ProfessionalModel;
	professionalId$: Observable<number>;
	oldProfessional: ProfessionalModel;
	selectedTab = 0;
	tabTitle: string = '';
	loadingSubject = new BehaviorSubject<boolean>(true);
	loading$: Observable<boolean>;
	professionalForm: FormGroup;
	hasFormErrors = false;
	availableYears: number[] = [];
	filteredColors: Observable<string[]>;
	filteredManufactures: Observable<string[]>;
	private componentSubscriptions: Subscription;
	private headerMargin: number;

	titlesForFilter: FilterModel[] = [];
	filteredTitles: Observable<FilterModel[]>;

	accCodesForFilter: FilterModel[] = [];

	citiesForFilter: FilterModel[] = [];
	filteredCities: Observable<FilterModel[]>;

	clinicCitiesForFilter: FilterModel[] = [];
	filteredClinicCities: Observable<FilterModel[]>;

	countriesForFilter: FilterModel[] = [];
	filteredCountries: Observable<FilterModel[]>;

	applicationMethodsForFilter: FilterModel[] = [];

	applicationMeansForFilter: FilterModel[] = [];

	contractStatusForFilter: FilterModel[] = [];

	accountCodesForFilter: FilterModel[] = [];

	collaborationCodesForFilter: FilterModel[] = [];

	documentListSentOptionsForFilter: FilterModel[];
	contractStatusOptionsForFilter: FilterModel[];

	protaxCodesForFilter: FilterModel[] = [];

	languagesForFilter: FilterModel[] = [];
	filteredLanguages: ReplaySubject<FilterModel[]> = new ReplaySubject<FilterModel[]>(1);

	public langMultiFilterCtrl: FormControl = new FormControl();
	public filteredLangsMulti: ReplaySubject<FilterModel[]> = new ReplaySubject<FilterModel[]>(1);

	fieldsForFilter: FilterModel[] = [];
	filteredFields: ReplaySubject<FilterModel[]> = new ReplaySubject<FilterModel[]>(1);
	public fieldMultiFilterCtrl: FormControl = new FormControl();
	public filteredFieldsMulti: ReplaySubject<FilterModel[]> = new ReplaySubject<FilterModel[]>(1);

	subCatsForFilter: FilterModel[] = [];
	filteredSubCats: ReplaySubject<FilterModel[]> = new ReplaySubject<FilterModel[]>(1);
	public subCatsMultiFilterCtrl: FormControl = new FormControl();
	public filteredSubCatsMulti: ReplaySubject<FilterModel[]> = new ReplaySubject<FilterModel[]>(1);

	protected _onDestroy = new Subject<void>();

	constructor(
		private store: Store<AppState>,
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private professionalFB: FormBuilder,
		public dialog: MatDialog,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private professionalService: ProfessionalsService,
		private servicesService: ServicesService,
		private staticService: StaticDataService,
		private spinner: NgxSpinnerService,
		private cdr: ChangeDetectorRef) {
		super();
	}

	ngOnInit() {

		this.loading$ = this.loadingSubject.asObservable();
		this.activatedRoute.params.subscribe(params => {
			const id = parseInt(params.id);
			if (id && id > 0) {
				this.proId = +id;
				//this.store.pipe(
				//	select(selectProfessionalById(id))
				//).subscribe(result => {
				//	if (!result) {

				//		return;
				//	}
				this.loadProfessionalFromService(id);

				//this.loadProfessional(result);
				//});
			} else {
				const newProfessional = new ProfessionalModel();
				newProfessional.clear();
				this.loadProfessional(newProfessional);
			}
		});

		this.subheaderService.setTitle('Professionals');

		window.onload = () => {
			const style = getComputedStyle(document.getElementById('kt_header'));
			this.headerMargin = parseInt(style.height, 0);
		};

	}

	loadProfessional(_professional, fromService: boolean = false) {
		if (!_professional) {
			this.goBack('');
		}
		this.professional = _professional;
		this.professionalId$ = of(_professional.id);
		this.oldProfessional = Object.assign({}, _professional);
		this.initProfessional();
		this.loadResources();

		if (fromService) {
			this.cdr.detectChanges();
		}
	}

	// If professional didn't find in store
	loadProfessionalFromService(professionalId) {
		this.spinner.show();
		this.professionalService.getProfessionalById(professionalId).toPromise().then(res => {
			this.loadProfessional((res as unknown as ApiResponse).data, true);
		}).catch(() => {
			this.spinner.hide();
		});
	}

	ngOnDestroy() {
		if (this.componentSubscriptions) {
			this.componentSubscriptions.unsubscribe();
		}
	}

	initProfessional() {
		this.createForm();
		this.loadingSubject.next(false);
		if (!this.professional.id) {
			this.subheaderService.setBreadcrumbs([
				{ title: 'Professional', page: `/professional-management` },
				{ title: 'Professionals', page: `/professional-management/professionals` },
				{ title: 'Create professional', page: `/professional-management/professionals/add` }
			]);
			return;
		}
		this.subheaderService.setTitle('Edit professional');
		this.subheaderService.setBreadcrumbs([
			{ title: 'Professional Management', page: `/professional-management` },
			{ title: 'Professionals', page: `/professional-management/professionals` },
			{ title: 'Edit professional', page: `/professional-management/professionals/edit`, queryParams: { id: this.professional.id } }
		]);
	}

	createForm() {
		this.professionalForm = this.professionalFB.group({

			// personal information
			titleId: [this.professional.titleId, [Validators.required]],
			name: [this.professional.name, [Validators.required]],
			email: [this.professional.email, [Validators.required, Validators.email]],
			email2: [this.professional.email2, [Validators.email]],
			dateOfBirth: [this.formatDate(this.professional.dateOfBirth), [Validators.required]],
			mobilePhone: [this.professional.mobilePhone, [Validators.required, Validators.pattern(MedelitConstants.mobnumPattern)]],
			telephone: [this.professional.telephone, [Validators.required, Validators.pattern(MedelitConstants.mobnumPattern)]],
			homePhone: [this.professional.homePhone, [Validators.pattern(MedelitConstants.mobnumPattern)]],
			clinicPhoneNumber: [this.professional.clinicPhoneNumber, [Validators.pattern(MedelitConstants.mobnumPattern)]],
			professionalLanguages: [this.professional.professionalLanguages, [Validators.required]],
			professionalFields: [this.professional.professionalFields, [Validators.required]],
			professionalSubCategories: [this.professional.professionalSubCategories, [Validators.required]],
			website: [this.professional.website, []],
			proOnlineCV: [this.professional.proOnlineCV, []],
			fax: [this.professional.fax],

			// conver maps
			coverMap: [this.professional.coverMap, []],

			// Addresses
			// home address
			streetName: [this.professional.streetName, [Validators.required]],
			city: [this.professional.city, [Validators.required]],
			countryId: [this.professional.countryId, [Validators.required]],
			postCode: [this.professional.postCode, [Validators.required]],

			// work clinic address
			clinicStreetName: [this.professional.clinicStreetName],
			clinicPostCode: [this.professional.clinicPostCode],
			clinicCity: [this.professional.clinicCity, Validators.required],

			// notes
			description: [this.professional.description],

			invoicingNotes: [this.professional.invoicingNotes],

			// Payments and Invoicing
			companyName: [this.professional.companyName],
			companyNumber: [this.professional.companyNumber],
			bank: [this.professional.bank],
			branch: [this.professional.branch],
			accountName: [this.professional.accountName],
			accountNumber: [this.professional.accountNumber],
			sortCode: [this.professional.sortCode],
			accountingCodeId: [this.professional.accountingCodeId, Validators.required],

			// contract details
			// hr information
			// : contract information
			activeCollaborationId: [this.professional.activeCollaborationId, Validators.required],
			contractDate: [this.formatDate(this.professional.contractDate)],
			contractEndDate: [this.formatDate(this.professional.contractEndDate)],
			clinicAgreement: [this.professional.clinicAgreement.toString(), Validators.required],
			firstContactDate: [this.formatDate(this.professional.firstContactDate), Validators.required],
			lastContactDate: [this.formatDate(this.professional.lastContactDate)],

			// Application
			applicationMethodId: [this.professional.applicationMethodId, Validators.required],
			applicationMeansId: [this.professional.applicationMeansId, Validators.required],
			colleagueReferring: [this.professional.colleagueReferring],

			// HR Status
			workPlace: [this.professional.workPlace],
			insuranceExpiryDate: [this.formatDate(this.professional.insuranceExpiryDate)],
			contractStatusId: [this.professional.contractStatusId],
			documentListSentId: [this.professional.documentListSentId, Validators.required],
			calendarActivation: [this.professional.calendarActivation.toString(), Validators.required],
			protaxCodeId: [this.professional.protaxCodeId]
		});
	}

	loadResources() {
		this.loadLanguagesForFilter();
		this.loadFieldsForFilter();
		//this.loadSubCatsForFilter();
		this.loadCountiesForFilter();

		this.staticService.getStaticDataForFitler().pipe(map(n => n.data as unknown as MedelitStaticData[])).toPromise().then((data) => {
			this.titlesForFilter = data.map((el) => { return { id: el.id, value: el.titles }; }).filter((e) => { if (e.value && e.value.length > 0) return e; });
			if (this.professional.titleId) {
				var obj = data.find((e) => { return e.id == this.professional.titleId });
				if (obj)
					this.professionalForm.get('titleId').setValue(obj.id);
			}

			// accound codes for filter
			this.accountCodesForFilter = data.map((el) => { return { id: el.id, value: el.accountingCodes }; }).filter((e) => { if (e.value && e.value.length > 0) return e; });
			if (this.professional.accountingCodeId) {
				var obj = data.find((e) => { return e.id == this.professional.accountingCodeId });
				if (obj)
					this.professionalForm.get('accountingCodeId').setValue(obj.id);
			}

			// collaboration codes for filter
			this.collaborationCodesForFilter = data.map((el) => { return { id: el.id, value: el.collaborationCodes }; }).filter((e) => { if (e.value && e.value.length > 0) return e; });
			if (this.professional.activeCollaborationId) {
				var obj = data.find((e) => { return e.id == this.professional.activeCollaborationId });
				if (obj)
					this.professionalForm.get('activeCollaborationId').setValue(obj.id);
			}

			// application methods for filter
			this.applicationMethodsForFilter = data.map((el) => { return { id: el.id, value: el.applicationMethods }; }).filter((e) => { if (e.value && e.value.length > 0) return e; });
			if (this.professional.applicationMethodId) {
				var obj = data.find((e) => { return e.id == this.professional.applicationMethodId });
				if (obj)
					this.professionalForm.get('applicationMethodId').setValue(obj.id);
			}
			// application means for filter
			this.applicationMeansForFilter = data.map((el) => { return { id: el.id, value: el.applicationMeans }; }).filter((e) => { if (e.value && e.value.length > 0) return e; });
			if (this.professional.applicationMethodId) {
				var obj = data.find((e) => { return e.id == this.professional.applicationMethodId });
				if (obj)
					this.professionalForm.get('applicationMethodId').setValue(obj.id);
			}

			// contract status for filter
			this.contractStatusForFilter = data.map((el) => { return { id: el.id, value: el.contractStatus }; }).filter((e) => { if (e.value && e.value.length > 0) return e; });
			if (this.professional.contractStatusId) {
				var obj = data.find((e) => { return e.id == this.professional.contractStatusId });
				if (obj)
					this.professionalForm.get('contractStatusId').setValue(obj.id);
			}

			// document list sent for filter
			this.documentListSentOptionsForFilter = data.map((el) => { return { id: el.id, value: el.documentListSentOptions }; }).filter((e) => { if (e.value && e.value.length > 0) return e; });
			if (this.professional.documentListSentId) {
				var obj = data.find((e) => { return e.id == this.professional.documentListSentId });
				if (obj)
					this.professionalForm.get('documentListSentId').setValue(obj.id);
			}

			// pro tax codes for filter
			this.protaxCodesForFilter = data.map((el) => { return { id: el.id, value: el.proTaxCodes }; }).filter((e) => { if (e.value && e.value.length > 0) return e; });
			if (this.professional.protaxCodeId) {
				var obj = data.find((e) => { return e.id == this.professional.protaxCodeId });
				if (obj)
					this.professionalForm.get('protaxCodeId').setValue(obj.id);
			}

		}).catch(() => {
			this.spinner.hide();
		}).finally(() => {
			this.spinner.hide();
		});
	}

	goBack(id) {
		this.loadingSubject.next(false);
		const url = `/professional-management/professionals?id=${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	goBackWithoutId() {
		this.router.navigateByUrl('/professional-management/professionals', { relativeTo: this.activatedRoute });
	}

	refreshProfessional(isNew: boolean = false, id = 0) {
		this.loadingSubject.next(false);
		let url = this.router.url;
		//if (!isNew) {
		//	this.router.navigate([url], { relativeTo: this.activatedRoute });
		//	return;
		//}

		url = `/professional-management/professionals/edit/${id}`;
		this.router.navigate([url]);

	}

	reset() {
		this.professional = Object.assign({}, this.oldProfessional);
		this.createForm();
		this.hasFormErrors = false;
		this.professionalForm.markAsPristine();
		this.professionalForm.markAsUntouched();
		this.professionalForm.updateValueAndValidity();
	}

	onSumbit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.professionalForm.controls;

		/** check form */
		if (this.professionalForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			window.scroll(0, 0);
			return;
		}

		// tslint:disable-next-line:prefer-const
		let editedProfessional = this.prepareProfessional();

		if (editedProfessional.id > 0) {
			this.updateProfessional(editedProfessional, withBack);
			return;
		}

		this.addProfessional(editedProfessional, withBack);
	}

	prepareProfessional(): ProfessionalModel {
		const controls = this.professionalForm.controls;
		const _professional = new ProfessionalModel();
		_professional.id = this.professional.id;
		_professional.titleId = controls.titleId.value;
		_professional.name = controls.name.value;
		_professional.email = controls.email.value;
		_professional.email2 = controls.email2.value;

		_professional.dateOfBirth = this.toDateFormat(controls.dateOfBirth.value);

		_professional.mobilePhone = controls.mobilePhone.value;
		_professional.telephone = controls.telephone.value;
		_professional.homePhone = controls.homePhone.value;
		_professional.clinicPhoneNumber = controls.clinicPhoneNumber.value;
		_professional.professionalLanguages = controls.professionalLanguages.value;
		_professional.professionalFields = controls.professionalFields.value;
		_professional.professionalSubCategories = controls.professionalSubCategories.value;
		_professional.website = controls.website.value;
		_professional.proOnlineCV = controls.proOnlineCV.value;
		_professional.fax = controls.fax.value;
		_professional.coverMap = controls.coverMap.value;
		_professional.streetName = controls.streetName.value;
		_professional.city = controls.city.value;
		if (controls.countryId.value)
			_professional.countryId = controls.countryId.value.id;

		_professional.postCode = controls.postCode.value;
		_professional.clinicStreetName = controls.clinicStreetName.value;
		_professional.clinicPostCode = controls.clinicPostCode.value;
		_professional.clinicCity = controls.clinicCity.value;

		_professional.description = controls.description.value;
		_professional.invoicingNotes = controls.invoicingNotes.value;
		_professional.companyName = controls.companyName.value;
		_professional.companyNumber = controls.companyNumber.value;
		_professional.bank = controls.bank.value;
		_professional.branch = controls.branch.value;
		_professional.accountName = controls.accountName.value;
		_professional.accountNumber = controls.accountNumber.value;
		_professional.sortCode = controls.sortCode.value;
		_professional.accountingCodeId = controls.accountingCodeId.value;
		_professional.activeCollaborationId = controls.activeCollaborationId.value;

		_professional.clinicAgreement = +controls.clinicAgreement.value;

		_professional.contractDate = this.toDateFormat(controls.contractDate.value);
		_professional.contractEndDate = this.toDateFormat(controls.contractEndDate.value);
		_professional.firstContactDate = this.toDateFormat(controls.firstContactDate.value);
		_professional.lastContactDate = this.toDateFormat(controls.lastContactDate.value);

		_professional.applicationMethodId = +controls.applicationMethodId.value;
		_professional.applicationMeansId = +controls.applicationMeansId.value;
		_professional.colleagueReferring = controls.colleagueReferring.value;
		_professional.workPlace = controls.workPlace.value;

		_professional.insuranceExpiryDate = this.toDateFormat(controls.insuranceExpiryDate.value);

		_professional.contractStatusId = +controls.contractStatusId.value;
		_professional.documentListSentId = controls.documentListSentId.value;
		_professional.calendarActivation = +controls.calendarActivation.value;
		_professional.protaxCodeId = controls.protaxCodeId.value;
		_professional.createDate = new Date();
		_professional.updateDate = new Date();

		return _professional;
	}

	addProfessional(_professional: ProfessionalModel, withBack: boolean = false) {
		this.spinner.show();
		this.professionalService.createProfessional(_professional).toPromise().then((res) => {
			this.spinner.hide();
			const resp = res as unknown as ApiResponse;
			if (resp.success && resp.data > 0) {
				const message = `New professional successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 10000, true, true);
				this.refreshProfessional(true, resp.data);
			} else {
				const message = resp.errors.join('<br/>');
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 10000, true, true);
			}
		}).catch((e) => {
			this.spinner.hide();
		});


		//this.loadingSubject.next(true);
		//this.store.dispatch(new ProfessionalOnServerCreated({ professional: _professional }));
		//this.componentSubscriptions = this.store.pipe(
		//	delay(1000),
		//	select(selectLastCreatedProfessionalId)
		//).subscribe(newId => {
		//	if (!newId) {
		//		return;
		//	}

		//	this.loadingSubject.next(false);
		//	if (withBack) {
		//		this.goBack(newId);
		//	} else {
		//		const message = `New professional successfully has been added.`;
		//		this.layoutUtilsService.showActionNotification(message, MessageType.Create, 10000, true, true);
		//		this.refreshProfessional(true, newId);
		//	}
		//});
	}

	updateProfessional(_professional: ProfessionalModel, withBack: boolean = false) {
		this.spinner.show();
		this.professionalService.updateProfessional(_professional).toPromise().then((res) => {
			const resp = res as unknown as ApiResponse;
			if (resp.success && resp.data > 0) {
				const message = `Professional successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 10000, true, true);
				this.professional.updateDate = new Date();
				this.cdr.markForCheck();
			} else {
				const message = resp.errors.join('<br/>');
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 10000, true, true);
			}
		}).catch((e) => {
			this.spinner.hide();
		}).finally(() => {
			this.spinner.hide();
		});
	}

	getComponentTitle() {
		let result = 'Create professional';
		if (this.selectedTab == 0) {

			if (!this.professional || !this.professional.id) {
				return result;
			}
			result = `Edit professional - ${this.professional.name}`;
		} else {
			result = this.tabTitle;
		}

		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

	/*fitlers aread*/
	// Title Filter
	loadTitlesForFilter() {
		this.staticService.getTitlesForFilter().subscribe(res => {
			this.titlesForFilter = res.data;

			this.filteredTitles = this.professionalForm.get('titleId').valueChanges
				.pipe(
					startWith(''),
					map(value => this._filterTitles(value))
				);
			if (this.professional.titleId > 0) {
				var title = this.titlesForFilter.find(x => x.id == this.professional.titleId);
				if (title) {
					this.professionalForm.patchValue({ 'titleId': { id: title.id, value: title.value } });
				}
			}
		});
	}

	private _filterTitles(value: string): FilterModel[] {
		const filterValue = this._normalizeValue(value);
		return this.titlesForFilter.filter(title => this._normalizeValue(title.value).includes(filterValue));
	}

	// end title fitler

	// Language Filter
	loadLanguagesForFilter() {
		this.staticService.getLanguagesForFilter().subscribe(res => {
			this.languagesForFilter = res.data;
			this.filteredLanguages.next(this.languagesForFilter.slice());

			if (this.professional.id) {
				var langs = this.professional.professionalLanguages as unknown as FilterModel[];
				var select: FilterModel[] = [];
				langs && langs.forEach((x) => {
					var findIndex = this.languagesForFilter.findIndex((el) => { return el.id == x.id });
					if (findIndex > -1)
						select.push(this.languagesForFilter[findIndex]);

				});
				this.professionalForm.patchValue({ 'professionalLanguages': select });
			}

			this.langMultiFilterCtrl.valueChanges
				.pipe(takeUntil(this._onDestroy))
				.subscribe(() => {
					this.filterLangsMulti();
				});
		});
	}

	private filterLangsMulti() {
		if (!this.languagesForFilter) {
			return;
		}
		// get the search keyword
		let search = this.langMultiFilterCtrl.value;
		if (!search) {
			this.filteredLanguages.next(this.languagesForFilter.slice());
			return;
		} else {
			search = search.toLowerCase();
		}
		// filter the banks
		this.filteredLanguages.next(
			this.languagesForFilter.filter(bank => bank.value.toLowerCase().indexOf(search) > -1)
		);
	}
	// end languages fitler

	// Fields For Filter
	loadFieldsForFilter() {
		this.staticService.getFieldsForFilter().subscribe(res => {
			this.fieldsForFilter = res.data;
			this.filteredFields.next(this.fieldsForFilter.slice());

			if (this.professional.id) {
				var fields = this.professional.professionalFields as unknown as FilterModel[];
				var select: FilterModel[] = [];
				fields && fields.forEach((x) => {
					var findIndex = this.fieldsForFilter.findIndex((el) => { return el.id == x.id });
					if (findIndex > -1)
						select.push(this.fieldsForFilter[findIndex]);
				});
				this.professionalForm.patchValue({ 'professionalFields': select });
			}

			this.loadSubCatsForFilter();
			this.fieldMultiFilterCtrl.valueChanges
				.pipe(takeUntil(this._onDestroy))
				.subscribe(() => {
					this.filterFieldsMulti();
				});
		});
	}

	private filterFieldsMulti() {
		if (!this.fieldsForFilter) {
			return;
		}
		// get the search keyword
		let search = this.fieldMultiFilterCtrl.value;
		if (!search) {
			this.filteredFields.next(this.fieldsForFilter.slice());
			return;
		} else {
			search = search.toLowerCase();
		}
		// filter the banks
		this.filteredFields.next(
			this.fieldsForFilter.filter(elem => elem.value.toLowerCase().indexOf(search) > -1)
		);
	}
	// end fields fitler
	// SubCats For Filter
	loadSubCatsForFilter() {
		var fields = this.professionalForm.get('professionalFields').value;
		this.staticService.getCategoriesForFilter(fields).subscribe(res => {
			this.subCatsForFilter = res.data;
			this.filteredSubCats.next(this.subCatsForFilter.slice());

			if (this.professional.id) {
				var cats = this.professional.professionalSubCategories as unknown as FilterModel[];
				var select: FilterModel[] = [];
				cats && cats.forEach((x) => {
					var findIndex = this.subCatsForFilter.findIndex((el) => { return el.id == x.id });
					if (findIndex > -1)
						select.push(this.subCatsForFilter[findIndex]);

				});
				this.professionalForm.patchValue({ 'professionalSubCategories': select });
			}

			this.subCatsMultiFilterCtrl.valueChanges
				.pipe(takeUntil(this._onDestroy))
				.subscribe(() => {
					this.filterSubCatsMulti();
				});
		});
	}

	private filterSubCatsMulti() {
		if (!this.fieldsForFilter) {
			return;
		}
		// get the search keyword
		let search = this.subCatsMultiFilterCtrl.value;
		if (!search) {
			this.filteredSubCats.next(this.fieldsForFilter.slice());
			return;
		} else {
			search = search.toLowerCase();
		}
		// filter the banks
		this.filteredSubCats.next(
			this.subCatsForFilter.filter(elem => elem.value.toLowerCase().indexOf(search) > -1)
		);
	}
	// end fields fitler

	// countries
	loadCountiesForFilter() {
		this.staticService.getCountriesForFilter().subscribe(res => {
			this.countriesForFilter = res.data;

			this.filteredCountries = this.professionalForm.get('countryId').valueChanges
				.pipe(
					startWith(''),
					map(value => this._filterCountries(value))
				);
			if (this.professional.countryId > 0) {
				var elem = this.countriesForFilter.find(x => x.id == this.professional.countryId);
				if (elem) {
					this.professionalForm.patchValue({ 'countryId': { id: elem.id, value: elem.value } });
				}
			}
		});

	}
	private _filterCountries(value: string): FilterModel[] {
		const filterValue = this._normalizeValue(value);
		return this.countriesForFilter.filter(title => this._normalizeValue(title.value).includes(filterValue));
	}
	// end account code id filter

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

	addService() {

		const dialogRef = this.dialog.open(AttachServiceToProDialogComponent, { data: this.professional.id });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			this.spinner.show();
			this.servicesService.getProfessionalRelations(this.professional.id).toPromise().then((res) => {
				if (res.success) {
					this.professional.professionalServices = res.data;
					this.cdr.detectChanges();
				}

			}).finally(() => {
				this.spinner.hide();

			});

			this.layoutUtilsService.showActionNotification("Changes saved successfully", MessageType.Create);
		});
	}


	removeService(serviceId: number) {
		const dialogRef = this.dialog.open(ConfirmDialogComponent, {
			width: '250px',
			data: { title: 'Professional detach', message: 'Are you sure to detach professional from this service?' }
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				this.spinner.show();
				this.servicesService.detachProfessioal(serviceId, this.professional.id).toPromise().then((res) => {
					if (res.success) {
						this.professional.professionalServices = res.data;
						this.cdr.detectChanges();
						this.layoutUtilsService.showActionNotification("Request processed successfully", MessageType.Delete, 3000);
					} else {
						if (res.errors)
							this.layoutUtilsService.showActionNotification(_.join(res.errors, "<br/>"), MessageType.Delete, 3000);
					}
				}).catch((err) => {
					this.spinner.hide();
					this.layoutUtilsService.showActionNotification("An error occured while porcessing your request. Please try again later.", MessageType.Update, 3000);
				}).finally(() => {
					this.spinner.hide();
				});
			}
		});
	}

	//editServiceFee(service: ServiceModel) {
	//	const dialogRef = this.dialog.open(AddFeeToServiceDialogComponent, { data: service });
	//	dialogRef.afterClosed().subscribe(res => {
	//		if (!res) {
	//			return;
	//		}
	//		this.spinner.show();
	//		this.servicesService.getProfessionalRelations(this.professional.id).toPromise().then((res) => {
	//			if (res.success) {
	//				this.professional.professionalServices = res.data;
	//				this.detectChanges();
	//			}
	//		}).finally(() => {
	//			this.spinner.hide();
	//		});

	//		this.layoutUtilsService.showActionNotification("Changes saved successfully", MessageType.Create);
	//		this.detectChanges();
	//	});
	//}

	detectChanges() {
		try {
			this.cdr.detectChanges();
		} catch (e) {
			console.log(e);
		}
	}


	tabChanged(event: MatTabChangeEvent) {
		this.tabTitle = event.tab.textLabel;
	}

	getUrl = (control) => {
		let val = this.professionalForm.get(control).value;
		if (!_.startsWith('www.', val)) {
			if (!(_.startsWith('http://', val) || _.startsWith('https://', val))) {
				val = 'http://' + val;
			}
		}
		return val ? new URL(val) : val;
	}

	getControl = controlName => {
		return this.professionalForm.get(controlName);
	}

	/*Start closed events */

	controlFocusout(control) {
		const val = this.professionalForm.get(control).value;
		if (val && val.id) return;
		this.professionalForm.get(control).setValue('');
		this.cdr.markForCheck();
	}

	/*End Closed events */

	goToLink(url: string) {
		window.open(`//${url}`, "_blank");
	}
}
