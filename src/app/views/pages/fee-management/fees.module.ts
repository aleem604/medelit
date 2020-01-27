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
    feesReducer,
    FeeEffects,
    StaticDataService,
    FeesService
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
import { NgbProgressbarModule, NgbProgressbarConfig } from '@ng-bootstrap/ng-bootstrap';
import { NgxPermissionsModule } from 'ngx-permissions';
import { FeesListComponent } from './fees/fees-list/fees-list.component';
import { FeesComponent } from './fees.component';
import { FeeEditDialogComponent } from './fees/fee-edit-dialog/fee-edit.dialog.component';
import { FeeEditComponent } from './fees/fee-edit/fee-edit.component';
import { AttachServiceToFeeDialogComponent } from './fees/attach-service-to-fee-dialog/attach-service-to-fee.dialog.component';
import { AttachProToFeeDialogComponent } from './fees/attach-pro-to-fee-dialog/attach-pro-to-fee.dialog.component';
import { FeeConnectedProfessionalsComponent } from './fees/connected-professionals/fee-connected-professionals.component';
import { FeeConnectedServicesComponent } from './fees/connected-services/fee-connected-services.component';


// tslint:disable-next-line:class-name
const routes: Routes = [
	{
		path: '',
		component: FeesComponent,
		// canActivate: [ModuleGuard],
		// data: { moduleName: 'ecommerce' },
		children: [
			{
				path: '',
				redirectTo: 'fees',
				pathMatch: 'full'
			},
			{
				path: 'fees',
				component: FeesListComponent
			},
			{
				path: 'fees/add',
				component: FeeEditComponent
			},
			{
				path: 'fees/edit/:id/:type',
				component: FeeEditComponent
			}
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
		environment.isMockEnabled ? HttpClientInMemoryWebApiModule.forFeature(FakeApiService, {
			passThruUnknownUrl: true,
        	dataEncapsulation: false
		}) : [],
		StoreModule.forFeature('fees', feesReducer),
		EffectsModule.forFeature([FeeEffects]),
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
		FeeEditDialogComponent,
		AttachProToFeeDialogComponent,
		AttachServiceToFeeDialogComponent
	],
	declarations: [
		FeesComponent,
		FeesListComponent,
		FeeEditDialogComponent,
		FeeEditComponent,
		FeeConnectedProfessionalsComponent,
		FeeConnectedServicesComponent,
		AttachProToFeeDialogComponent,
		AttachServiceToFeeDialogComponent
	]
})
export class FeesModule { }
