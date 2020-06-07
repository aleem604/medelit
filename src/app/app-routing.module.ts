// Angular
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
// Components
import {BaseComponent} from './views/theme/base/base.component';
import {ErrorPageComponent} from './views/theme/content/error-page/error-page.component';
// Auth
import {AuthGuard} from './core/auth';

const routes: Routes = [
	{path: 'auth', loadChildren: () => import('./views/pages/auth/auth.module').then(m => m.AuthModule)},

	{
		path: '',
		component: BaseComponent,
		canActivate: [AuthGuard],
		children: [
			{
				path: 'dashboard',
				loadChildren: () => import('./views/pages/dashboard/dashboard.module').then(m => m.DashboardModule),
			},
			{
				path: 'search',
				loadChildren: () => import('./views/pages/search/search.module').then(m => m.SearchModule),
			},
			{
				path: 'lead-management',
				loadChildren: () => import('./views/pages/lead-management/leads.module').then(m => m.LeadsModule),
			},
			{
				path: 'customer-management',
				loadChildren: () => import('./views/pages/customer-management/customers.module').then(m => m.CustomersModule),
			},
			{
				path: 'booking-management',
				loadChildren: () => import('./views/pages/booking-management/bookings.module').then(m => m.BookingsModule),
			},
			{
				path: 'invoice-management',
				loadChildren: () => import('./views/pages/invoice-management/invoices.module').then(m => m.InvoicesModule),
			},
			{
				path: 'invoice-entity-management',
				loadChildren: () => import('./views/pages/invoice-entity-management/invoice-entities.module').then(m => m.InvoiceEntitiesModule),
			},
			{
				path: 'professional-management',
				loadChildren: () => import('./views/pages/professional-management/professionals.module').then(m => m.ProfessionalsModule),
			},
			{
				path: 'fee-management',
				loadChildren: () => import('./views/pages/fee-management/fees.module').then(m => m.FeesModule),
			},
			{
				path: 'service-management',
				loadChildren: () => import('./views/pages/service-management/services.module').then(m => m.ServicesModule),
			},
			{
				path: 'user-management',
				loadChildren: () => import('./views/pages/user-management/user-management.module').then(m => m.UserManagementModule),
			},
			{
				path: 'builder',
				loadChildren: () => import('./views/theme/content/builder/builder.module').then(m => m.BuilderModule),
			},
			{
				path: 'error/403',
				component: ErrorPageComponent,
				data: {
					type: 'error-v6',
					code: 403,
					title: '403... Access forbidden',
					desc: 'Looks like you don\'t have permission to access for requested page.<br> Please, contact administrator',
				},
			},
			{path: 'error/:type', component: ErrorPageComponent},
			{path: '', redirectTo: 'dashboard', pathMatch: 'full'},
			{path: '**', redirectTo: 'dashboard', pathMatch: 'full'},
		],
	},

	{path: '**', redirectTo: 'error/403', pathMatch: 'full'},
];

@NgModule({
	imports: [
		RouterModule.forRoot(routes),
	],
	exports: [RouterModule],
})
export class AppRoutingModule {
}
