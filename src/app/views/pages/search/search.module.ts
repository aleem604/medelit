// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { PartialsModule } from '../../partials/partials.module';
import { ModuleGuard } from '../../../core/auth';

import {
    leadsReducer,
    LeadEffects,
    LeadsService,
    customersReducer,
    CustomerEffects,
    invoiceEntitiesReducer,
    InvoiceEntityEffects,
    bookingsReducer,
    BookingEffects,
    invoicesReducer,
    InvoiceEffects,
    ServiceEffects,
    FeeEffects,
    feesReducer,
    servicesReducer,
    professionalsReducer,
    ProfessionalEffects
} from '../../../core/medelit';

import { HttpUtilsService,
	TypesUtilsService,
	InterceptService,
	LayoutUtilsService
} from '../../../core/_base/crud';

import {
	ActionNotificationComponent,
	DeleteEntityDialogComponent,
	FetchEntityDialogComponent,
	UpdateStatusDialogComponent
} from '../../partials/content/crud';


// Material
import {
	MatInputModule,
	MatPaginatorModule,
	MatProgressSpinnerModule,
	MatSortModule,
	MatTableModule,
	MatSelectModule,
	MatMenuModule,
	MatProgressBarModule,
	MatButtonModule,
	MatCheckboxModule,
	MatDialogModule,
	MatTabsModule,
	MatNativeDateModule,
	MatCardModule,
	MatRadioModule,
	MatIconModule,
	MatDatepickerModule,
	MatAutocompleteModule,
	MAT_DIALOG_DEFAULT_OPTIONS,
	MatSnackBarModule,
	MatTooltipModule,
    MatChipsModule} from '@angular/material';
import { NgbProgressbarModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxPermissionsModule } from 'ngx-permissions';
import { StaticDataService, InvoiceEntitiesService, CustomersService, BookingService, InvoicesService, ProfessionalsService, ServicesService, FeesService } from '../../../core/medelit/_services';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { CreateInvoiceEntityDialogComponent } from '../../partials/create-invoice-entity/create-invoice-entity.dialog.component';
import { AlertDialogComponent } from '../../partials/alert-dialog/alert-dialog.component';
import { CSVFileUploadDialogComponent } from '../../partials/csv-file-upload-dialog/csv-file-upload.dialog.component';
import { NgxMaskModule } from 'ngx-mask';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker'
import { SearchComponent } from './search.component';
import { SearchListComponent } from './search-list/search-list.component';
import { SearchLeadsComponent } from './leads-search/search-leads.component';
import { SearchCustomersComponent } from './customers-search/customers-search.component';
import { InvoiceEntitiesSearchComponent } from './invoice-entities-search/invoice-entities-search.component';
import { SearchBookingsComponent } from './bookings-search/search-bookings.component';
import { SearchInvociesComponent } from './invocies-search/search-invocies.component';
import { SearchProfessionalComponent } from './professional-search/search-professionals.component';
import { SearchServiceComponent } from './service-search/search-services.component';
import { SearchFeesComponent } from './fees-search/search-fees.component';

// tslint:disable-next-line:class-name
const routes: Routes = [
	{
		path: '',
		component: SearchComponent,
		// canActivate: [ModuleGuard],
		// data: { moduleName: 'ecommerce' },
		children: [
			{
				path: '',
				redirectTo: 'search',
				pathMatch: 'full'
			},
			{
				path: 'search',
				component: SearchListComponent
			},			
		]
	}
];

@NgModule({
	imports: [
		MatDialogModule,
		CommonModule,
		HttpClientModule,
		PartialsModule,
		NgxPermissionsModule.forChild(),
		RouterModule.forChild(routes),
	
		FormsModule,
		ReactiveFormsModule,
		TranslateModule.forChild(),
		MatButtonModule,
		MatMenuModule,
		MatSelectModule,
        MatInputModule,
		MatTableModule,
		MatChipsModule,
		MatAutocompleteModule,
		MatRadioModule,
		MatIconModule,
		MatNativeDateModule,
		MatProgressBarModule,
		MatDatepickerModule,
		MatCardModule,
		MatPaginatorModule,
		MatSortModule,
		MatCheckboxModule,
		MatProgressSpinnerModule,
		MatSnackBarModule,
		MatTabsModule,
		MatTooltipModule,
		NgbProgressbarModule,
		NgxMatSelectSearchModule,
		NgbModule,
		OwlDateTimeModule,
		OwlNativeDateTimeModule,
		BsDatepickerModule,
		NgxMaskModule.forRoot(),
		StoreModule.forFeature('leads', leadsReducer),
		StoreModule.forFeature('customers', customersReducer),
		StoreModule.forFeature('invoiceEntities', invoiceEntitiesReducer),
		StoreModule.forFeature('bookings', bookingsReducer),
		StoreModule.forFeature('invoices', invoicesReducer),
		StoreModule.forFeature('professionals', professionalsReducer),
		StoreModule.forFeature('services', servicesReducer),
		StoreModule.forFeature('fees', feesReducer),

		EffectsModule.forFeature([LeadEffects, CustomerEffects, InvoiceEntityEffects, BookingEffects, InvoiceEffects, ProfessionalEffects, ServiceEffects, FeeEffects]),
		
	],
	providers: [
		ModuleGuard,
		InterceptService,
      	{
        	provide: HTTP_INTERCEPTORS,
       	 	useClass: InterceptService,
        	multi: true
      	},
		{
			provide: MAT_DIALOG_DEFAULT_OPTIONS,
			useValue: {
				hasBackdrop: true,
				panelClass: 'kt-mat-dialog-container__wrapper',
				height: 'auto',
				width: '900px'
			}
		},
		
		TypesUtilsService,
		LayoutUtilsService,
		HttpUtilsService,
		LeadsService,
		CustomersService,
		InvoiceEntitiesService,
		BookingService,
		InvoicesService,
		ProfessionalsService,
		ServicesService,
		FeesService,

		StaticDataService,
		TypesUtilsService,
		LayoutUtilsService
	],
	entryComponents: [
		ActionNotificationComponent,
		DeleteEntityDialogComponent,
		FetchEntityDialogComponent,
		UpdateStatusDialogComponent,
		AlertDialogComponent,
		CSVFileUploadDialogComponent,
		CreateInvoiceEntityDialogComponent
	],
	declarations: [
		SearchComponent,
		SearchListComponent,
		SearchLeadsComponent,
		SearchCustomersComponent,
		InvoiceEntitiesSearchComponent,
		SearchBookingsComponent,
		SearchInvociesComponent,
		SearchProfessionalComponent,
		SearchServiceComponent,
		SearchFeesComponent
	]
})
export class SearchModule { }
