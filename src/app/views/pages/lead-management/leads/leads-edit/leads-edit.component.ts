// Angular
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// Material
import { MatDialog } from '@angular/material';
// RxJS
import { Observable, BehaviorSubject, Subscription, of } from 'rxjs';
import { map, startWith, delay, first } from 'rxjs/operators';
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
	selectLastCreatedLeadId,
	selectLeadById,
	SPECIFICATIONS_DICTIONARY,
	LeadModel,
	LeadOnServerCreated,
	LeadUpdated,
	LeadsService,
    StaticDataModel,
    StaticDataService,
    FilterModel,
    ApiResponse
} from '../../../../../core/medelit';


@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-lead-edit',
	templateUrl: './leads-edit.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeadEditComponent implements OnInit, OnDestroy {
	// Public properties
	lead: LeadModel;
	leadId$: Observable<number>;
	titles: Observable<StaticDataModel>;
	languages: Observable<StaticDataModel>;
	countries: Observable<StaticDataModel>;
	cities: Observable<StaticDataModel>;
	relationaships: Observable<StaticDataModel>;
	services: Observable<StaticDataModel>;
	oldLead: LeadModel;
	selectedTab = 0;
	loadingSubject = new BehaviorSubject<boolean>(true);
	loading$: Observable<boolean>;
	leadForm: FormGroup;
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

	languagesForFilter: FilterModel[] = [];
	filteredLanguages: Observable<FilterModel[]>;

	countriesForCountryOfBirthForFilter: FilterModel[] = [];
	filteredCountriesForCountryOfBirth: Observable<FilterModel[]>;

	relationshipsForFilter: FilterModel[] = [];
	filteredRelationships: Observable<FilterModel[]>;

	constructor(
		private store: Store<AppState>,
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private typesUtilsService: TypesUtilsService,
		private leadFB: FormBuilder,
		public dialog: MatDialog,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private layoutConfigService: LayoutConfigService,
		private leadService: LeadsService,
		private staticService:StaticDataService,
		private cdr: ChangeDetectorRef) {
	}

	ngOnInit() {
		this.loading$ = this.loadingSubject.asObservable();
		this.loadingSubject.next(true);
		this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id && id > 0) {

				this.store.pipe(
					select(selectLeadById(id))
				).subscribe(result => {
					if (!result) {
						this.loadLeadFromService(id);
						return;
					}

					this.loadLead(result);
				});
			} else {
				const newLead = new LeadModel();
				newLead.clear();
				this.loadLead(newLead);
			}
		});

		// sticky portlet header
		window.onload = () => {
			const style = getComputedStyle(document.getElementById('kt_header'));
			this.headerMargin = parseInt(style.height, 0);
		};
	}

	loadLead(_lead, fromService: boolean = false) {
		if (!_lead) {
			this.goBack('');
		}
		this.lead = _lead;
		this.leadId$ = of(_lead.id);
		this.oldLead = Object.assign({}, _lead);
		this.initLead();
		this.loadTitlesForFilter();
		this.loadLanguagesForFilter();
		this.loadCountriesForCountryOfBirthFilter();
		this.loadRelationshipsForFilter();
		if (fromService) {
			this.cdr.detectChanges();
		}
	}

	loadLeadFromService(leadId) {
		this.leadService.getLeadById(leadId).subscribe(res => {
			let data = res as unknown as ApiResponse;
			this.loadLead(data.data, true);
		});
	}

	ngOnDestroy() {
		if (this.componentSubscriptions) {
			this.componentSubscriptions.unsubscribe();
		}
	}

	initLead() {
		this.createForm();
		this.loadingSubject.next(false);
		if (!this.lead.id) {
			this.subheaderService.setBreadcrumbs([
				{ title: 'lead-management', page: `/leads` },
				{ title: 'Leads', page: `/lead-management/leads` },
				{ title: 'Create lead', page: `/lead-management/leads/add` }
			]);
			return;
		}
		this.subheaderService.setTitle('Leads');

		this.subheaderService.setBreadcrumbs([
			{ title: 'lead-management', page: `/leads` },
			{ title: 'Leads', page: `/lead-management/leads` },
			{ title: 'Edit lead', page: `/lead-management/leads/edit`, queryParams: { id: this.lead.id } }
		]);
		
	}

	createForm() {
		this.leadForm = this.leadFB.group({
			titleId: [this.lead.titleId, Validators.required],
			surName: [this.lead.surName, [Validators.required, Validators.min(4), Validators.max(250)]],
			name: [this.lead.name, Validators.required],
			languageId: [this.lead.languageId, [Validators.required]],
			mainPhone: [this.lead.mainPhone,[]],
			mainPhoneOwner: [this.lead.mainPhoneOwner],
			contactPhone: [this.lead.contactPhone,[]],
			phone2: [this.lead.phone2, []],
			phone2Owner: [this.lead.phone2Owner, [Validators.max(250)]],
			phone3: [this.lead.phone3, []],
			phone3Owner: [this.lead.phone3Owner, [Validators.max(250)]],
			email: [this.lead.email, [Validators.email, Validators.max(250)]],
			fax: [this.lead.fax, [Validators.max(250)]],
			dateOfBirth: [this.lead.dateOfBirth, [Validators.max(250)]],
			countryOfBirthId: [this.lead.countryOfBirthId, [Validators.max(250)]],
			visitRequestingPerson: [this.lead.visitRequestingPerson, [Validators.max(250)]],
			visitRequestingPersonRelationId: [this.lead.visitRequestingPersonRelationId, []],		
			gpCode: [this.lead.gpCode, [Validators.max(250)]],
		});

	}

	goBack(id) {
		this.loadingSubject.next(false);
		const url = `/lead-management/leads?id=${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	goBackWithoutId() {
		this.router.navigateByUrl('/lead-management/leads', { relativeTo: this.activatedRoute });
	}

	refreshLead(isNew: boolean = false, id = 0) {
		this.loadingSubject.next(false);
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/lead-management/leads/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	reset() {
		this.lead = Object.assign({}, this.oldLead);
		this.createForm();
		this.hasFormErrors = false;
		this.leadForm.markAsPristine();
		this.leadForm.markAsUntouched();
		this.leadForm.updateValueAndValidity();
	}

	onSumbit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.leadForm.controls;
		/** check form */
		if (this.leadForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		// tslint:disable-next-line:prefer-const
		let editedLead = this.prepareLead();

		if (editedLead.id > 0) {
			this.updateLead(editedLead, withBack);
			return;
		}

		this.addLead(editedLead, withBack);
	}

	prepareLead(): LeadModel {
		const controls = this.leadForm.controls;
		const _lead = new LeadModel();
		_lead.id = this.lead.id;

		_lead._userId = 1; // TODO: get version from userId
		_lead._createdDate = this.lead._createdDate;
		_lead._updatedDate = this.lead._updatedDate;
		_lead._updatedDate = this.typesUtilsService.getDateStringFromDate();
		_lead._createdDate = this.lead.id > 0 ? _lead._createdDate : _lead._updatedDate;
		return _lead;
	}

	addLead(_lead: LeadModel, withBack: boolean = false) {
		this.loadingSubject.next(true);
		this.store.dispatch(new LeadOnServerCreated({ lead: _lead }));
		this.componentSubscriptions = this.store.pipe(
			delay(1000),
			select(selectLastCreatedLeadId)
		).subscribe(newId => {
			if (!newId) {
				return;
			}

			this.loadingSubject.next(false);
			if (withBack) {
				this.goBack(newId);
			} else {
				const message = `New lead successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 10000, true, true);
				this.refreshLead(true, newId);
			}
		});
	}

	updateLead(_lead: LeadModel, withBack: boolean = false) {
		this.loadingSubject.next(true);

		const updateLead: Update<LeadModel> = {
			id: _lead.id,
			changes: _lead
		};

		this.store.dispatch(new LeadUpdated({
			partialLead: updateLead,
			lead: _lead
		}));

		of(undefined).pipe(delay(3000)).subscribe(() => { // Remove this line
			if (withBack) {
				this.goBack(_lead.id);
			} else {
				const message = `Lead successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 10000, true, true);
				this.refreshLead(false);
			}
		}); // Remove this line
	}

	getComponentTitle() {
		let result = 'Create lead';
		if (!this.lead || !this.lead.id) {
			return result;
		}

		result = `Edit lead - ${this.lead.surName} ${this.lead.name}`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}


/*Fitlers Section*/
	loadTitlesForFilter() {
		this.staticService.getTitlesForFilter().subscribe(res => {
			this.titlesForFilter = res.data;

			this.filteredTitles = this.leadForm.get('titleId').valueChanges
				.pipe(
					startWith(''),
					map(value => this._filterTitles(value))
				);
			if (this.lead.titleId > 0) {
				var title = this.titlesForFilter.find(x => x.id == this.lead.titleId);
				if (title) {
					this.leadForm.patchValue({ 'titleId': { id: title.id, value: title.value } });
				}
			}
		});

	}
	private _filterTitles(value: string): FilterModel[] {
		const filterValue = this._normalizeValue(value);
		return this.titlesForFilter.filter(title => this._normalizeValue(title.value).includes(filterValue));
	}

	//// Languages
	loadLanguagesForFilter() {
		this.staticService.getLanguagesForFilter().subscribe(res => {
			this.languagesForFilter = res.data;

			this.filteredLanguages = this.leadForm.get('languageId').valueChanges
				.pipe(
					startWith(''),
					map(value => this._filterLanguages(value))
				);
			if (this.lead.languageId > 0) {
				var title = this.languagesForFilter.find(x => x.id == this.lead.titleId);
				if (title) {
					this.leadForm.patchValue({ 'languageId': { id: title.id, value: title.value } });
				}
			}
		});

	}
	private _filterLanguages(value: string): FilterModel[] {
		const filterValue = this._normalizeValue(value);
		return this.languagesForFilter.filter(title => this._normalizeValue(title.value).includes(filterValue));
	}
	// end languages

	//// Country of Birth
	loadCountriesForCountryOfBirthFilter() {
		this.staticService.getCountriesForFilter().subscribe(res => {
			this.countriesForCountryOfBirthForFilter = res.data;

			this.filteredCountriesForCountryOfBirth = this.leadForm.get('countryOfBirthId').valueChanges
				.pipe(
					startWith(''),
					map(value => this.filteredCountryOfBirth(value))
				);
			if (this.lead.languageId > 0) {
				var title = this.countriesForCountryOfBirthForFilter.find(x => x.id == this.lead.titleId);
				if (title) {
					this.leadForm.patchValue({ 'countryOfBirthId': { id: title.id, value: title.value } });
				}
			}
		});

	}
	private filteredCountryOfBirth(value: string): FilterModel[] {
		const filterValue = this._normalizeValue(value);
		return this.countriesForCountryOfBirthForFilter.filter(title => this._normalizeValue(title.value).includes(filterValue));
	}
	// end Country of Birth

	//// relationships
	loadRelationshipsForFilter() {
		this.staticService.getRelationshipsForFilter().subscribe(res => {
			this.relationshipsForFilter = res.data;

			this.filteredRelationships = this.leadForm.get('visitRequestingPersonRelationId').valueChanges
				.pipe(
					startWith(''),
					map(value => this._filterRelationships(value))
				);
			if (this.lead.visitRequestingPersonRelationId > 0) {
				var title = this.relationshipsForFilter.find(x => x.id == this.lead.titleId);
				if (title) {
					this.leadForm.patchValue({ 'visitRequestingPersonRelationId': { id: title.id, value: title.value } });
				}
			}
		});

	}
	private _filterRelationships(value: string): FilterModel[] {
		const filterValue = this._normalizeValue(value);
		return this.relationshipsForFilter.filter(title => this._normalizeValue(title.value).includes(filterValue));
	}
	// end languages






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

	/*End Filters Section*/
}
