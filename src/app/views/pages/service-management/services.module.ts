// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
// Fake API Angular-in-memory
import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
// Translate Module
import { TranslateModule } from '@ngx-translate/core';
// NGRX
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
// UI
import { PartialsModule } from '../../partials/partials.module';
// Core
import { FakeApiService } from '../../../core/_base/layout';
// Auth
import { ModuleGuard } from '../../../core/auth';
// Core => Services
import {
    fieldsReducer,
    FieldEffects,
    FieldsService,

    servicesReducer,
    ServiceEffects
} from '../../../core/medelit';
// Core => Utils
import { HttpUtilsService,
	TypesUtilsService,
	InterceptService,
	LayoutUtilsService
} from '../../../core/_base/crud';
// Shared
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

    MatChipsModule
} from '@angular/material';
import { environment } from '../../../../environments/environment';
import { CoreModule } from '../../../core/core.module';
import { NgbProgressbarModule, NgbProgressbarConfig } from '@ng-bootstrap/ng-bootstrap';
import { NgxPermissionsModule } from 'ngx-permissions';
import { ServicesComponent } from './services.component';
import { ServicesListComponent } from './services/services-list/services-list.component';
import { ServiceEditComponent } from './services/service-edit/service-edit.component';
import { FieldsListComponent } from './fields/fields-list/fields-list.component';
import { FieldEditComponent } from './fields/field-edit/field-edit.component';
import { StaticDataService, ServicesService } from '../../../core/medelit/_services';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { ServiceFeesComponent } from './services/service-fees/service-fees.component';
import { ServiceProfessionalsComponent } from './services/service-professionals/service-professionals.component';
import { ServiceConnectedBookingsComponent } from './services/service-connected-bookings/service-connected-bookings.component';
import { ServiceConnectedInvoicesComponent } from './services/service-connected-invoices/service-connected-invoies.component';
import { ServiceConnectedLeadsComponent } from './services/service-connected-leads/service-connected-leads.component';




// tslint:disable-next-line:class-name
const routes: Routes = [
	{
		path: '',
		component: ServicesComponent,
		// canActivate: [ModuleGuard],
		// data: { moduleName: 'ecommerce' },
		children: [
			{
				path: '',
				redirectTo: 'services',
				pathMatch: 'full'
			},
			{
				path: 'services',
				component: ServicesListComponent
			},
			
			{
				path: 'services/add',
				component: ServiceEditComponent
			},
			{
				path: 'services/edit/:id',
				component: ServiceEditComponent
			},
			{
				path: 'fields',
				component: FieldsListComponent
			},

			{
				path: 'fields/add',
				component: FieldEditComponent
			},
			{
				path: 'fields/edit/:id',
				component: FieldEditComponent
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
		MatChipsModule,
		NgxMatSelectSearchModule,
		environment.isMockEnabled ? HttpClientInMemoryWebApiModule.forFeature(FakeApiService, {
			passThruUnknownUrl: true,
        	dataEncapsulation: false
		}) : [],
		StoreModule.forFeature('fields', fieldsReducer),
		EffectsModule.forFeature([FieldEffects]),
		StoreModule.forFeature('services', servicesReducer),
		EffectsModule.forFeature([ServiceEffects])
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
		FieldsService,
		ServicesService,
		StaticDataService,
		TypesUtilsService,
		LayoutUtilsService
	],
	entryComponents: [
		ActionNotificationComponent,
		DeleteEntityDialogComponent,
		FetchEntityDialogComponent,
		UpdateStatusDialogComponent
	],
	declarations: [
		ServicesComponent,
		ServicesListComponent,
		ServiceEditComponent,

		FieldsListComponent,
		FieldEditComponent,
		ServiceFeesComponent,
		ServiceProfessionalsComponent,
		ServiceConnectedBookingsComponent,
		ServiceConnectedInvoicesComponent,
		ServiceConnectedLeadsComponent
	]
})
export class ServicesModule { }
