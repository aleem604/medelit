// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

import { TranslateModule } from '@ngx-translate/core';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgxMaskModule } from 'ngx-mask';
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
	CustomersService,
	professionalsReducer,
	ProfessionalEffects,
	ProfessionalsService,
	StaticDataService,
    ServicesService
	
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
import { NgbProgressbarModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxPermissionsModule } from 'ngx-permissions';
import { ProfessionalsComponent } from './professionals.component';
import {
	ProfessionalsListComponent,
	ProfessionalEditComponent,
	AttachServiceToProDialogComponent,
	AddFeeToServiceDialogComponent,
	ConnectedCustomersComponent,
	ConnectedBookingsComponent,
	ConnectedInvoicesComponent,
	ConnectedLeadsComponent,
	ProfessionalConnectedServicesComponent
} from '.';
import { ConfirmDialogComponent } from '../../partials/confirm-dialog/confirm-dialog.component';



// tslint:disable-next-line:class-name
const routes: Routes = [
	{
		path: '',
		component: ProfessionalsComponent,
		// canActivate: [ModuleGuard],
		// data: { moduleName: 'ecommerce' },
		children: [
			{
				path: '',
				redirectTo: 'professionals',
				pathMatch: 'full'
			},
			{
				path: 'professionals',
				component: ProfessionalsListComponent
			},
			
			{
				path: 'professionals/add',
				component: ProfessionalEditComponent
			},
			{
				path: 'professionals/edit/:id',
				component: ProfessionalEditComponent
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
		MatChipsModule,
		MatPaginatorModule,
		MatSortModule,
		MatCheckboxModule,
		MatProgressSpinnerModule,
		MatSnackBarModule,
		MatTabsModule,
		MatTooltipModule,
		NgbProgressbarModule,
		NgxMatSelectSearchModule,
		NgxSpinnerModule,
		NgxMaskModule.forRoot(),
		BsDatepickerModule,

		StoreModule.forFeature('professionals', professionalsReducer),
		EffectsModule.forFeature([ProfessionalEffects]),
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
		CustomersService,
		ProfessionalsService,
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
		AttachServiceToProDialogComponent,
		ConfirmDialogComponent,
		AddFeeToServiceDialogComponent
	],
	declarations: [
		ProfessionalsComponent,
		ProfessionalsListComponent,
		ProfessionalEditComponent,
		AttachServiceToProDialogComponent,
		ConnectedCustomersComponent,
		ConnectedBookingsComponent,
		ConnectedInvoicesComponent,
		ConnectedLeadsComponent,
		AddFeeToServiceDialogComponent,
		ProfessionalConnectedServicesComponent
	]
})
export class ProfessionalsModule { }
