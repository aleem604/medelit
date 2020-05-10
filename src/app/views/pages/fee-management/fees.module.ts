// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TranslateModule } from '@ngx-translate/core';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { PartialsModule } from '../../partials/partials.module';
import { FakeApiService } from '../../../core/_base/layout';
import { ModuleGuard } from '../../../core/auth';
import {
    feesReducer,
    FeeEffects,
    StaticDataService,
    FeesService
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
import { FeesListComponent } from './fees/fees-list/fees-list.component';
import { FeesComponent } from './fees.component';
import { FeeEditDialogComponent } from './fees/fee-edit-dialog/fee-edit.dialog.component';
import { FeeEditComponent } from './fees/fee-edit/fee-edit.component';
import { AttachServiceToFeeDialogComponent } from './fees/attach-service-to-fee-dialog/attach-service-to-fee.dialog.component';
import { AttachProToFeeDialogComponent } from './fees/attach-pro-to-fee-dialog/attach-pro-to-fee.dialog.component';
import { FeeConnectedProfessionalsComponent } from './fees/connected-professionals/fee-connected-professionals.component';
import { FeeConnectedServicesComponent } from './fees/connected-services/fee-connected-services.component';
import { AttachFeesToProServiceDialogComponent } from './fees/attach-fees-to-pro-service-dialog/attach-fees-to-pro-service.dialog.component';
import { NgxMaskModule } from 'ngx-mask';


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
		NgxMaskModule.forRoot(),
		BsDatepickerModule,

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
		AttachServiceToFeeDialogComponent,
		AttachFeesToProServiceDialogComponent
	],
	declarations: [
		FeesComponent,
		FeesListComponent,
		FeeEditDialogComponent,
		FeeEditComponent,
		FeeConnectedProfessionalsComponent,
		FeeConnectedServicesComponent,
		AttachProToFeeDialogComponent,
		AttachServiceToFeeDialogComponent,
		AttachFeesToProServiceDialogComponent
	]
})
export class FeesModule { }
