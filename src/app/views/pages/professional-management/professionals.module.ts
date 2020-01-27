// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
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
import { ProfessionalsListComponent } from './professionals/professionals-list/professionals-list.component';
import { ProfessionalEditComponent } from './professionals/professinal-edit/professional-edit.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ConfirmDialogComponent } from '../../partials/confirm-dialog/confirm-dialog.component';
import { ConnectedCustomersComponent } from './professionals/connected-customers/connected-customers.component';
import { ConnectedBookingsComponent } from './professionals/connected-bookings/connected-bookings.component';
import { ConnectedInvoicesComponent } from './professionals/connected-invoices/connected-invoies.component';
import { ConnectedLeadsComponent } from './professionals/connected-leads/connected-leads.component';
import { AttachServiceToProDialogComponent } from './professionals/attach-service-to-pro-dialog/attach-service-to-pro.dialog.component';
import { ProfessionalConnectedServicesComponent } from './professionals/professional-connected-services/professional-connected-services.component';
import { AddFeeToServiceDialogComponent } from './professionals/add-fee-to-service-dialog/add-fee-to-service.dialog.component';


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
		environment.isMockEnabled ? HttpClientInMemoryWebApiModule.forFeature(FakeApiService, {
			passThruUnknownUrl: true,
        	dataEncapsulation: false
		}) : [],
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
