import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-search-list',
	templateUrl: './search-list.component.html',
	styleUrls: ['search-list.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchListComponent {

	searchText: string;
	constructor() { }

	triggerSearch(value: string) {
		this.searchText = value;
	}
	
}
