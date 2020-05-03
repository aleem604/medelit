// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { TextMaskModule } from 'angular2-text-mask';


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
	bookingsReducer,
	BookingService,

	BookingEffects
} from '../../../core/medelit';
// Core => Utils
import {
	HttpUtilsService,
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
import { StaticDataService, InvoicesService } from '../../../core/medelit/_services';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { BookingsComponent } from './bookings.component';
import { AlertDialogComponent } from '../../partials/alert-dialog/alert-dialog.component';
import { NgxMaskModule } from 'ngx-mask';
import {
	BookingEditComponent,
	BookingCloneDialog,
	BookingCycleDialog,
	BookingToInvoiceDialog,
	BookingConnectedBookingsComponent,
	BookingConnectedProfessinalsComponent,
	BookingConnectedInvoicesComponent
} from '.';
import { BookingsListComponent } from './bookings/bookings-list/bookings-list.component';

// tslint:disable-next-line:class-name
const routes: Routes = [
	{
		path: '',
		component: BookingsComponent,
		// canActivate: [ModuleGuard],
		// data: { moduleName: 'ecommerce' },
		children: [
			{
				path: '',
				redirectTo: 'bookings',
				pathMatch: 'full'
			},
			{
				path: 'bookings',
				component: BookingsListComponent
			},

			{
				path: 'bookings/add',
				component: BookingEditComponent
			},
			{
				path: 'bookings/edit/:id',
				component: BookingEditComponent
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
		NgxMaterialTimepickerModule,
		TextMaskModule,
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
		OwlDateTimeModule,
		OwlNativeDateTimeModule,
		NgxMaskModule.forRoot(),

		environment.isMockEnabled ? HttpClientInMemoryWebApiModule.forFeature(FakeApiService, {
			passThruUnknownUrl: true,
			dataEncapsulation: false
		}) : [],
		StoreModule.forFeature('bookings', bookingsReducer),
		EffectsModule.forFeature([BookingEffects]),
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
		BookingService,
		InvoicesService,
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
		BookingCloneDialog,
		BookingCycleDialog,
		BookingToInvoiceDialog
	],
	declarations: [
		BookingsComponent,
		BookingsListComponent,
		BookingEditComponent,
		BookingCloneDialog,
		BookingCycleDialog,
		BookingToInvoiceDialog,
		BookingConnectedBookingsComponent,
		BookingConnectedProfessinalsComponent,
		BookingConnectedInvoicesComponent
	]
})
export class BookingsModule { }
