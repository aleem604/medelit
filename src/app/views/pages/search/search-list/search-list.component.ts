import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-search-list',
	templateUrl: './search-list.component.html',
	styleUrls: ['search-list.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchListComponent implements OnInit, OnDestroy {

	@ViewChild('searchInput', { static: true }) searchInput: ElementRef;

	filterControl = new FormControl('0', []);
	constructor() { }


	ngOnInit() {

	}

	ngOnDestroy() {
	}

	/* csv file upload */


	
}
