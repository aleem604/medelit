import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ReplaySubject, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { MatSelect } from '@angular/material/select';

export interface Bank {
	id: string;
	name: string;
}

export interface BankGroup {
	name: string;
	banks: Bank[];
}



@Component({
	selector: 'app-multiple-selection-example',
	templateUrl: './mat-select-search.component.html',
	styleUrls: ['./mat-select-search.component.scss']
})
export class MultipleSelectioComponent implements OnInit, AfterViewInit, OnDestroy {

	/** list of banks */
	protected banks: Bank[] = [
		{ name: 'Bank A (Switzerland)', id: 'A' },
		{ name: 'Bank B (Switzerland)', id: 'B' },
		{ name: 'Bank C (France)', id: 'C' },
		{ name: 'Bank D (France)', id: 'D' },
		{ name: 'Bank E (France)', id: 'E' },
		{ name: 'Bank F (Italy)', id: 'F' },
		{ name: 'Bank G (Italy)', id: 'G' },
		{ name: 'Bank H (Italy)', id: 'H' },
		{ name: 'Bank I (Italy)', id: 'I' },
		{ name: 'Bank J (Italy)', id: 'J' },
		{ name: 'Bank Kolombia (United States of America)', id: 'K' },
		{ name: 'Bank L (Germany)', id: 'L' },
		{ name: 'Bank M (Germany)', id: 'M' },
		{ name: 'Bank N (Germany)', id: 'N' },
		{ name: 'Bank O (Germany)', id: 'O' },
		{ name: 'Bank P (Germany)', id: 'P' },
		{ name: 'Bank Q (Germany)', id: 'Q' },
		{ name: 'Bank R (Germany)', id: 'R' }
	];

	/** control for the selected bank for multi-selection */
	public bankMultiCtrl: FormControl = new FormControl();

	/** control for the MatSelect filter keyword multi-selection */
	public bankMultiFilterCtrl: FormControl = new FormControl();

	/** list of banks filtered by search keyword */
	public filteredBanksMulti: ReplaySubject<Bank[]> = new ReplaySubject<Bank[]>(1);

	@ViewChild('multiSelect', { static: true }) multiSelect: MatSelect;

	/** Subject that emits when the component has been destroyed. */
	protected _onDestroy = new Subject<void>();


	constructor() { }

	ngOnInit() {
		// set initial selection
		this.bankMultiCtrl.setValue([this.banks[10], this.banks[11], this.banks[12]]);

		// load the initial bank list
		this.filteredBanksMulti.next(this.banks.slice());

		// listen for search field value changes
		this.bankMultiFilterCtrl.valueChanges
			.pipe(takeUntil(this._onDestroy))
			.subscribe(() => {
				this.filterBanksMulti();
			});
	}

	ngAfterViewInit() {
		this.setInitialValue();
	}

	ngOnDestroy() {
		this._onDestroy.next();
		this._onDestroy.complete();
	}

	/**
	 * Sets the initial value after the filteredBanks are loaded initially
	 */
	protected setInitialValue() {
		this.filteredBanksMulti
			.pipe(take(1), takeUntil(this._onDestroy))
			.subscribe(() => {
				// setting the compareWith property to a comparison function
				// triggers initializing the selection according to the initial value of
				// the form control (i.e. _initializeSelection())
				// this needs to be done after the filteredBanks are loaded initially
				// and after the mat-option elements are available
				this.multiSelect.compareWith = (a: Bank, b: Bank) => a && b && a.id === b.id;
			});
	}

	protected filterBanksMulti() {
		if (!this.banks) {
			return;
		}
		// get the search keyword
		let search = this.bankMultiFilterCtrl.value;
		if (!search) {
			this.filteredBanksMulti.next(this.banks.slice());
			return;
		} else {
			search = search.toLowerCase();
		}
		// filter the banks
		this.filteredBanksMulti.next(
			this.banks.filter(bank => bank.name.toLowerCase().indexOf(search) > -1)
		);
	}

}
