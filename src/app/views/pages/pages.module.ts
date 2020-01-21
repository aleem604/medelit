import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { PartialsModule } from '../partials/partials.module';
import { CoreModule } from '../../core/core.module';
import { UserManagementModule } from './user-management/user-management.module';

@NgModule({
	declarations: [],
	exports: [],
	imports: [
		CommonModule,
		HttpClientModule,
		FormsModule,
		CoreModule,
		PartialsModule,
		UserManagementModule,
	],
	providers: []
})
export class PagesModule {
}
