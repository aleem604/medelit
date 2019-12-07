// Angular
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
// Material
import { MatDialog, MatAutocomplete, MatChipInputEvent, MatAutocompleteSelectedEvent, MatSelect } from '@angular/material';
// RxJS
import { Observable, BehaviorSubject, Subscription, of, Subject, ReplaySubject } from 'rxjs';
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
	selectLastCreatedProfessionalId,
	selectProfessionalById,
	SPECIFICATIONS_DICTIONARY,
	ProfessionalModel,
	ProfessionalOnServerCreated,
	ProfessionalUpdated,
	ProfessionalsService,

	FilterModel,
	StaticDataService,
	ApiResponse
} from '../../../../../core/medelit';
import { ENTER, COMMA, CONTROL } from '@angular/cdk/keycodes';
import { lang } from 'moment';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-professional-edit',
	templateUrl: './professional-edit.component.html',
	styleUrls: ['./professional-edit.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfessionalEditComponent implements OnInit, OnDestroy {
	/// chipset propertier
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
	loadingSubject = new BehaviorSubject<boolean>(true);
	loading$: Observable<boolean>;
	professionalForm: FormGroup;
	hasFormErrors = false;
	availableYears: number[] = [];
	filteredColors: Observable<string[]>;
	filteredManufactures: Observable<string[]>;
	// Private password
	private componentSubscriptions: Subscription;
	// sticky portlet header margin
	private headerMargin: number;

	titlesForFilter: FilterModel[] = [];
	filteredTitles: Observable<FilterModel[]>;

	accCodesForFilter: FilterModel[] = [];
	filteredAccCodes: Observable<FilterModel[]>;

	citiesForFilter: FilterModel[] = [];
	filteredCities: Observable<FilterModel[]>;

	clinicCitiesForFilter: FilterModel[] = [];
	filteredClinicCities: Observable<FilterModel[]>;

	countriesForFilter: FilterModel[] = [];
	filteredCountries: Observable<FilterModel[]>;

	applicationMethodsForFilter: FilterModel[] = [];
	filteredApplicationMethods: Observable<FilterModel[]>;

	applicationMeansForFilter: FilterModel[] = [];
	filteredApplicationMeans: Observable<FilterModel[]>;

	contractStatusForFilter: FilterModel[] = [];
	filteredContractStatus: Observable<FilterModel[]>;

	accountCodesForFilter: FilterModel[] = [];
	filteredAccountCodes: Observable<FilterModel[]>;

	collaborationCodesForFilter: FilterModel[] = [];
	filteredCollaborationCodes: Observable<FilterModel[]>;

	documentListSentOptions$: Observable<FilterModel[]>;
	contractStatusOptions$: Observable<FilterModel[]>;

	languagesForFilter: FilterModel[] = [];
	filteredLanguages: ReplaySubject<FilterModel[]> = new ReplaySubject<FilterModel[]>(1);


	public langMultiCtrl: FormControl = new FormControl();
	public langMultiFilterCtrl: FormControl = new FormControl();
	public filteredLangsMulti: ReplaySubject<FilterModel[]> = new ReplaySubject<FilterModel[]>(1);
	@ViewChild('multiSelect', { static: true }) multiSelect: MatSelect;
	protected _onDestroy = new Subject<void>();


	//@ViewChild('langInput', { static: false }) langInput: ElementRef<HTMLInputElement>;
	//@ViewChild('langAuto', { static: false }) matAutocomplete: MatAutocomplete;

	constructor(
		private store: Store<AppState>,
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private typesUtilsService: TypesUtilsService,
		private professionalFB: FormBuilder,
		public dialog: MatDialog,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private layoutConfigService: LayoutConfigService,
		private professionalService: ProfessionalsService,
		private staticService: StaticDataService,

		private cdr: ChangeDetectorRef) {
	}

	ngOnInit() {

		this.loading$ = this.loadingSubject.asObservable();
		this.loadingSubject.next(true);
		this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id && id > 0) {

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
		this.loadLanguagesForFilter();
		this.loadTitlesForFilter();
		this.loadAccountCodesForFilter();
		this.loadCountiesForFilter();
		this.loadCitiesForFilter();
		this.loadClinicCitiesForFilter();
		this.loadActiveCollaborationsForFilter();
		this.loadApplicationMethodsForFilter();
		this.loadApplicationMeansForFilter();

	
		if (fromService) {
			this.cdr.detectChanges();
		}
	}

	// If professional didn't find in store
	loadProfessionalFromService(professionalId) {
		this.professionalService.getProfessionalById(professionalId).subscribe(res => {
			this.loadProfessional((res as unknown as ApiResponse).data, true);
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
			dateOfBirth: [this.professional.dateOfBirth, [Validators.required]],
			mobilePhone: [this.professional.mobilePhone, [Validators.required]],
			telephone: [this.professional.telephone, [Validators.required]],
			homePhone: [this.professional.homePhone],
			clinicPhoneNumber: [this.professional.clinicPhoneNumber],
			languages: [this.professional.languages, [Validators.required]],
			website: [this.professional.website],
			proOnlineCV: [this.professional.proOnlineCV, [Validators.required]],
			fax: [this.professional.fax],

			// conver maps
			coverMap: [this.professional.coverMap],

			// Addresses
			// home address
			streetName: [this.professional.streetName, [Validators.required]],
			cityId: [this.professional.cityId, [Validators.required]],
			countryId: [this.professional.countryId, [Validators.required]],
			postCode: [this.professional.postCode, [Validators.required]],

			// work clinic address
			clinicStreetName: [this.professional.clinicStreetName],
			clinicPostCode: [this.professional.clinicPostCode],
			clinicCityId: [this.professional.clinicCityId],

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
			contractDate: [this.professional.contractDate],
			contractEndDate: [this.professional.contractEndDate],
			clinicAgreement: [this.professional.clinicAgreement.toString(), Validators.required],
			firstContactDate: [this.professional.firstContactDate, Validators.required],
			lastContactDate: [this.professional.lastContactDate],

			// Application
			applicationMethodId: [this.professional.applicationMethodId, Validators.required],
			applicationMeansId: [this.professional.applicationMeansId, Validators.required],
			colleagueReferring: [this.professional.colleagueReferring],


			// HR Status
			workPlace: [this.professional.workPlace],
			insuranceExpiryDate: [this.professional.insuranceExpiryDate],
			contractStatusId: [this.professional.contractStatusId],
			documentListSentId: [this.professional.documentListSentId, Validators.required],
			calendarActivation: [this.professional.calendarActivation.toString(), Validators.required],
			protaxCode: [this.professional.protaxCode],

		});

		this.staticService.getDocumentListSentForFilter().pipe(map(n => n.data as unknown as FilterModel[])).toPromise().then((res) => {
			this.documentListSentOptions$ = of(res);
			var data = res;
			if (this.professional.documentListSentId) {
				this.professionalForm.get('documentListSentId').setValue(data.find((el) => {return el.id == this.professional.documentListSentId }));
			}

		});
		this.staticService.getContractStatusOptions().pipe(map(n => n.data as unknown as FilterModel[])).toPromise().then((res) => {
			this.contractStatusOptions$ = of(res);
			var data = res;
			if (this.professional.contractStatusId) {
				this.professionalForm.get('contractStatusId').setValue(data.find((el) => { return el.id == this.professional.contractStatusId }));
			}
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
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/professional-management/professionals/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
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

		if (controls.titleId.value)
			_professional.titleId = controls.titleId.value.id;
		_professional.name = controls.name.value;
		_professional.email = controls.email.value;
		_professional.email2 = controls.email2.value;
		_professional.dateOfBirth = controls.dateOfBirth.value;
		_professional.mobilePhone = controls.mobilePhone.value;
		_professional.telephone = controls.telephone.value;
		_professional.homePhone = controls.homePhone.value;
		_professional.clinicPhoneNumber = controls.clinicPhoneNumber.value;
		_professional.languages = controls.languages.value;
		_professional.website = controls.website.value;
		_professional.proOnlineCV = controls.proOnlineCV.value;
		_professional.fax = controls.fax.value;
		_professional.coverMap = controls.coverMap.value;
		_professional.streetName = controls.streetName.value;
		if (controls.cityId.value)
			_professional.cityId = controls.cityId.value.id;
		if (controls.countryId.value)
			_professional.countryId = controls.countryId.value.id;

		_professional.postCode = controls.postCode.value;
		_professional.clinicStreetName = controls.clinicStreetName.value;
		_professional.clinicPostCode = controls.clinicPostCode.value;
		if (controls.clinicCityId.value)
			_professional.clinicCityId = controls.clinicCityId.value.id;

		_professional.description = controls.description.value;
		_professional.invoicingNotes = controls.invoicingNotes.value;
		_professional.companyName = controls.companyName.value;
		_professional.companyNumber = controls.companyNumber.value;
		_professional.bank = controls.bank.value;
		_professional.branch = controls.branch.value;
		_professional.accountName = controls.accountName.value;
		_professional.accountNumber = controls.accountNumber.value;
		_professional.sortCode = controls.sortCode.value;
		if (controls.accountingCodeId.value)
			_professional.accountingCodeId = controls.accountingCodeId.value.id;
		if (controls.activeCollaborationId.value)
			_professional.activeCollaborationId = controls.activeCollaborationId.value.id;
		_professional.contractDate = controls.contractDate.value;
		_professional.contractEndDate = controls.contractEndDate.value;
		_professional.clinicAgreement = +controls.clinicAgreement.value;
		_professional.firstContactDate = controls.firstContactDate.value;
		_professional.lastContactDate = controls.lastContactDate.value;
		if (controls.applicationMethodId.value)
			_professional.applicationMethodId = controls.applicationMethodId.value.id;
		if (controls.applicationMeansId.value)
			_professional.applicationMeansId = controls.applicationMeansId.value.id;
		_professional.colleagueReferring = controls.colleagueReferring.value;
		_professional.workPlace = controls.workPlace.value;
		_professional.insuranceExpiryDate = controls.insuranceExpiryDate.value;
		if (controls.contractStatusId.value)
			_professional.contractStatusId = controls.contractStatusId.value.id;
		if (controls.documentListSentId.value)
			_professional.documentListSentId = controls.documentListSentId.value.id;
		_professional.calendarActivation = +controls.calendarActivation.value;
		_professional.protaxCode = controls.protaxCode.value;

		return _professional;
	}

	addProfessional(_professional: ProfessionalModel, withBack: boolean = false) {
		this.loadingSubject.next(true);
		this.store.dispatch(new ProfessionalOnServerCreated({ professional: _professional }));
		this.componentSubscriptions = this.store.pipe(
			delay(1000),
			select(selectLastCreatedProfessionalId)
		).subscribe(newId => {
			if (!newId) {
				return;
			}

			this.loadingSubject.next(false);
			if (withBack) {
				this.goBack(newId);
			} else {
				const message = `New professional successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 10000, true, true);
				this.refreshProfessional(true, newId);
			}
		});
	}

	updateProfessional(_professional: ProfessionalModel, withBack: boolean = false) {
		this.loadingSubject.next(true);

		const updateProfessional: Update<ProfessionalModel> = {
			id: _professional.id,
			changes: _professional
		};

		this.store.dispatch(new ProfessionalUpdated({
			partialProfessional: updateProfessional,
			professional: _professional
		}));

		of(undefined).pipe(delay(3000)).subscribe(() => { // Remove this line
			if (withBack) {
				this.goBack(_professional.id);
			} else {
				const message = `Professional successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 10000, true, true);
				this.refreshProfessional(false);
			}
		}); // Remove this line
	}

	getComponentTitle() {
		let result = 'Create professional';
		if (!this.professional || !this.professional.id) {
			return result;
		}

		result = `Edit professional - ${this.professional.name}, ${this.professional.email}`;
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
				var langs = this.professional.languages as unknown as FilterModel[];
				var select: FilterModel[] = [];
				langs && langs.forEach((x) => {
					var findIndex = this.languagesForFilter.findIndex((el) => { return el.id == x.id });
					if (findIndex > -1)
						select.push(this.languagesForFilter[findIndex]);

				});
				this.professionalForm.patchValue({ 'languages': select });
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

	// account code id filter
	loadAccountCodesForFilter() {
		this.staticService.getAccountingCodesForFilter().subscribe(res => {
			this.accountCodesForFilter = res.data;

			this.filteredAccountCodes = this.professionalForm.get('accountingCodeId').valueChanges
				.pipe(
					startWith(''),
					map(value => this._filterAccountingCodes(value))
				);
			if (this.professional.accountingCodeId > 0) {
				var elem = this.accountCodesForFilter.find(x => x.id == this.professional.accountingCodeId);
				if (elem) {
					this.professionalForm.patchValue({ 'accountingCodeId': { id: elem.id, value: elem.value } });
				}
			}
		});

	}
	private _filterAccountingCodes(value: string): FilterModel[] {
		const filterValue = this._normalizeValue(value);
		return this.accountCodesForFilter.filter(title => this._normalizeValue(title.value).includes(filterValue));
	}
	// end account code id filter

	// cities
	loadCitiesForFilter() {
		this.staticService.getCitiesForFilter().subscribe(res => {
			this.citiesForFilter = res.data;

			this.filteredCities = this.professionalForm.get('cityId').valueChanges
				.pipe(
					startWith(''),
					map(value => this._filterCities(value))
				);
			if (this.professional.cityId > 0) {
				var elem = this.citiesForFilter.find(x => x.id == this.professional.cityId);
				if (elem) {
					this.professionalForm.patchValue({ 'cityId': { id: elem.id, value: elem.value } });
				}
			}
		});

	}
	private _filterCities(value: string): FilterModel[] {
		const filterValue = this._normalizeValue(value);
		return this.citiesForFilter.filter(title => this._normalizeValue(title.value).includes(filterValue));
	}
	// end clinic cities
	//clinic  cities
	loadClinicCitiesForFilter() {
		this.staticService.getCitiesForFilter().subscribe(res => {
			this.clinicCitiesForFilter = res.data;

			this.filteredClinicCities = this.professionalForm.get('clinicCityId').valueChanges
				.pipe(
					startWith(''),
					map(value => this._filterClinicCities(value))
				);
			if (this.professional.cityId > 0) {
				var elem = this.clinicCitiesForFilter.find(x => x.id == this.professional.clinicCityId);
				if (elem) {
					this.professionalForm.patchValue({ 'clinicCityId': { id: elem.id, value: elem.value } });
				}
			}
		});

	}
	private _filterClinicCities(value: string): FilterModel[] {
		const filterValue = this._normalizeValue(value);
		return this.clinicCitiesForFilter.filter(title => this._normalizeValue(title.value).includes(filterValue));
	}
	// end account code id filter




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

	// active collaboration
	loadActiveCollaborationsForFilter() {
		this.staticService.getCollaborationCodes().subscribe(res => {
			this.collaborationCodesForFilter = res.data;

			this.filteredCollaborationCodes = this.professionalForm.get('activeCollaborationId').valueChanges
				.pipe(
					startWith(''),
					map(value => this._filterCollaborationCodes(value))
				);
			if (this.professional.countryId > 0) {
				var elem = this.countriesForFilter.find(x => x.id == this.professional.activeCollaborationId);
				if (elem) {
					this.professionalForm.patchValue({ 'activeCollaborationId': { id: elem.id, value: elem.value } });
				}
			}
		});

	}
	private _filterCollaborationCodes(value: string): FilterModel[] {
		const filterValue = this._normalizeValue(value);
		return this.collaborationCodesForFilter.filter(title => this._normalizeValue(title.value).includes(filterValue));
	}
	// end account code id filter

	// applicaitonMethods
	loadApplicationMethodsForFilter() {
		this.staticService.getApplicationMethodsForFilter().subscribe(res => {
			this.applicationMethodsForFilter = res.data;

			this.filteredApplicationMethods = this.professionalForm.get('applicationMethodId').valueChanges
				.pipe(
					startWith(''),
					map(value => this._filterApplicationMethods(value))
				);
			if (this.professional.applicationMethodId > 0) {
				var elem = this.countriesForFilter.find(x => x.id == this.professional.applicationMethodId);
				if (elem) {
					this.professionalForm.patchValue({ 'applicationMethodId': { id: elem.id, value: elem.value } });
				}
			}
		});

	}
	private _filterApplicationMethods(value: string): FilterModel[] {
		const filterValue = this._normalizeValue(value);
		return this.applicationMethodsForFilter.filter(title => this._normalizeValue(title.value).includes(filterValue));
	}
	// end account code id filter

	// applicaitonMeans
	loadApplicationMeansForFilter() {
		this.staticService.getApplicationMeansForFilter().subscribe(res => {
			this.applicationMeansForFilter = res.data;

			this.filteredApplicationMeans = this.professionalForm.get('applicationMeansId').valueChanges
				.pipe(
					startWith(''),
					map(value => this._filterApplicationMeans(value))
				);
			if (this.professional.applicationMeansId > 0) {
				var elem = this.countriesForFilter.find(x => x.id == this.professional.applicationMeansId);
				if (elem) {
					this.professionalForm.patchValue({ 'applicationMeansId': { id: elem.id, value: elem.value } });
				}
			}
		});

	}
	private _filterApplicationMeans(value: string): FilterModel[] {
		const filterValue = this._normalizeValue(value);
		return this.applicationMeansForFilter.filter(title => this._normalizeValue(title.value).includes(filterValue));
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


}
