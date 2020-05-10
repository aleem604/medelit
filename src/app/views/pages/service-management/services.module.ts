/// <reference path="index.ts" />
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

import { PartialsModule } from '../../partials/partials.module';
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

import { NgbProgressbarModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxPermissionsModule } from 'ngx-permissions';
import { ServicesComponent } from './services.component';
import { StaticDataService, ServicesService } from '../../../core/medelit/_services';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import * as _index from '.';
import { NgxMaskModule } from 'ngx-mask';

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
				component: _index.ServicesListComponent
			},
			
			{
				path: 'services/add',
				component: _index.ServiceEditComponent
			},
			{
				path: 'services/edit/:id',
				component: _index.ServiceEditComponent
			},
			{
				path: 'fields',
				component: _index.FieldsListComponent
			},

			{
				path: 'fields/add',
				component: _index.FieldEditComponent
			},
			{
				path: 'fields/edit/:id',
				component: _index.FieldEditComponent
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
		NgxMaskModule.forRoot(),
		BsDatepickerModule,

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
		UpdateStatusDialogComponent,
		_index.ServiceProfessionalConnectDialogComponent,
		_index.EditServiceProfessionalRowDialog,
		_index.ServiceConnectedPtFeeDialogComponent,
		_index.ServiceConnectedProFeeDialogComponent
	],
	declarations: [
		ServicesComponent,
		_index.ServicesListComponent,
		_index.ServiceEditComponent,

		_index.FieldsListComponent,
		_index.FieldEditComponent,
		_index.ServiceProfessionalsComponent,
		_index.ServiceConnectedProfessionalsComponent,
		_index.ServiceConnectedBookingsComponent,
		_index.ConnectedCustomersInvoicingEntitiesComponent,
		_index.ServiceConnectedInvoicesComponent,
		_index.ServiceConnectedLeadsComponent,


		_index.ProfessionalToServiceListingComponent,
		_index.ServiceProfessionalConnectDialogComponent,
		_index.EditServiceProfessionalRowDialog,

		_index.ServiceConnectedPtFeeDialogComponent,
		_index.ServiceConnectedPtFeeListingComponent,

		_index.ServiceConnectedProFeeDialogComponent,
		_index.ServiceConnectedProFeeListingComponent,
	]
})
export class ServicesModule { }
