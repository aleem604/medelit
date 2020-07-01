// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

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
    invoiceEntitiesReducer,
    InvoiceEntityEffects,
    InvoiceEntitiesService,
    StaticDataService
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
	MatTooltipModule
} from '@angular/material';
import { NgbProgressbarModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxPermissionsModule } from 'ngx-permissions';
import { NgxMaskModule } from 'ngx-mask';
import { InvoiceEntitiesComponent } from './invoice-entities.component';
import {
	InvoiceEntitiesListComponent,
	InvoiceEntityEditComponent,
	InvoiceEntityConnectedServicesComponent,
	InvoiceEntityConnectedCustomersComponent,
	InvoiceEntityConnectedProfessinalsComponent,
	InvoieEntityConnectedBookingsComponent,
	InvoiceEntityConnectedInvoicesComponent,
	InvoieEntityConnectedLeadsComponent
} from '.';


// tslint:disable-next-line:class-name
const routes: Routes = [
	{
		path: '',
		component: InvoiceEntitiesComponent,
		// canActivate: [ModuleGuard],
		// data: { moduleName: 'ecommerce' },
		children: [
			{
				path: '',
				redirectTo: 'invoice-entities',
				pathMatch: 'full'
			},
			{
				path: 'invoice-entities',
				component: InvoiceEntitiesListComponent
			},
			
			{
				path: 'invoice-entities/add',
				component: InvoiceEntityEditComponent
			},
			{
				path: 'invoice-entities/edit/:id',
				component: InvoiceEntityEditComponent
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
		NgxMaskModule.forRoot(),
		BsDatepickerModule,

		StoreModule.forFeature('invoiceEntities', invoiceEntitiesReducer),
		EffectsModule.forFeature([InvoiceEntityEffects]),		
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
		InvoiceEntitiesService,
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
		InvoiceEntitiesComponent,
		InvoiceEntitiesListComponent,
		InvoiceEntityEditComponent,
		InvoiceEntityConnectedServicesComponent,
		InvoiceEntityConnectedCustomersComponent,
		InvoiceEntityConnectedProfessinalsComponent,
		InvoieEntityConnectedBookingsComponent,
		InvoiceEntityConnectedInvoicesComponent,
		InvoieEntityConnectedLeadsComponent,
	]
})
export class InvoiceEntitiesModule { }
