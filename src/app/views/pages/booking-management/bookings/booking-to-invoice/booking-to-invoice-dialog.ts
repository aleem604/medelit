import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BookingModel, FilterModel, StaticDataService, InvoicesService } from '../../../../../core/medelit';
import { FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { startWith, map } from 'rxjs/operators';

@Component({
	selector: 'booking-to-invoice-dialog',
	templateUrl: './booking-to-invoice-dialog.html',
	styleUrls: ['./booking-to-invoice-dialog.scss']
})
export class BookingToInvoiceDialog implements OnInit {

	hasFormErrors = false;
	operationErrors: string;
	invoice: number;
	invoiceCtrl: FormControl;
	invoicesForFilter: FilterModel[] = [];
	filteredInvoices: Observable<FilterModel[]>;

	constructor(
		public dialogRef: MatDialogRef<BookingToInvoiceDialog>,
		@Inject(MAT_DIALOG_DATA) public data: BookingModel,
		private staticService: StaticDataService,
		private invoiceService: InvoicesService,
		private spinner: NgxSpinnerService
	) { }

	ngOnInit(): void {
		this.invoiceCtrl = new FormControl('', Validators.required);
	
		this.staticService.getInvoicesForFilter().toPromise().then((r) => {
			this.invoicesForFilter = r.data;
			this.filteredInvoices = this.invoiceCtrl.valueChanges.pipe(
				startWith(''),
				map(value => this.filterInvoices(value))
			);
		})
			.catch(() => {
			});
	}

	private filterInvoices(value: string): FilterModel[] {
		const filterValue = this._normalizeValue(value);
		return this.invoicesForFilter.filter(title => this._normalizeValue(title.value).includes(filterValue));
	}

	displayFn(option: FilterModel): string {
		if (option)
			return option.value;
		return '';
	}

	private _normalizeValue(value: string): string {
		if (value && value.length > 0)
			return value.toLowerCase().replace(/\s/g, '');
		return value;
	}

	attachToBooking(s: FilterModel) {
		if (this.invoiceCtrl.valid) {
			this.spinner.show();
			this.invoiceService.addBookingToInvoice(this.data.id, this.invoiceCtrl.value.id).toPromise().then((res) => {
				this.spinner.hide();
				if (res.success) {
					this.dialogRef.close(res.data);
				} else {
					this.hasFormErrors = true;
					this.operationErrors = res.errors[0];
				}
			}).catch(() => {
				this.spinner.hide();
				this.hasFormErrors = true;
				this.operationErrors = 'An error occured while prcessing your request. Please try again later.';
			});
		}
	}

	onCancel(): void {
		this.dialogRef.close();
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}
}
