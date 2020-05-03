import { Component, OnInit, Inject, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSort, MatPaginator, MatTableDataSource } from '@angular/material';
import { Subscription } from 'rxjs';

import { SelectionModel } from '@angular/cdk/collections';
import { NgxSpinnerService } from 'ngx-spinner';
import { BookingsToAddToInvoiceDialogModel, InvoicesService, ApiResponse } from '../../../../../../core/medelit';
import { LayoutUtilsService, MessageType } from '../../../../../../core/_base/crud';


@Component({
	// tslint:disable-next-line:component-selector
	selector: 'add-booking-to-invoice-dialog',
	templateUrl: './add-booking-to-invoice.dialog.html',
	styleUrls: ['./add-booking-to-invoice.dialog.scss']
})
export class AddBookingToInvoiceDialog implements OnInit, OnDestroy {
	@ViewChild(MatSort, { static: true }) sort: MatSort;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	viewLoading = false;

	displayedColumns: string[] = ['select', 'name', 'phoneNumber', 'feeName'];
	dataSource = new MatTableDataSource<BookingsToAddToInvoiceDialogModel>();
	selection = new SelectionModel<BookingsToAddToInvoiceDialogModel>(true, []);

	private subscriptions: Subscription[] = [];
	constructor(public dialogRef: MatDialogRef<AddBookingToInvoiceDialog>,
		@Inject(MAT_DIALOG_DATA) public data: number,
		private invoiceService: InvoicesService,
		private spinner: NgxSpinnerService,
		private layoutUtilsService: LayoutUtilsService,
		private cdr: ChangeDetectorRef) {

	}

	ngOnInit() {
		this.loadDialogData();
	}

	loadDialogData() {

		this.viewLoading = true;
		this.invoiceService.getBookingsToAddToInvoice(this.data).toPromise().then((resp) => {
			var res = resp as unknown as ApiResponse;
			if (res.success) {
				this.dataSource = new MatTableDataSource<BookingsToAddToInvoiceDialogModel>(res.data);
				this.dataSource.paginator = this.paginator;
				this.dataSource.sort = this.sort;
			}
		}).catch(() => {
			this.viewLoading = false;
		}).finally(() => {
			this.viewLoading = false;
		});
	}

	isAllSelected() {
		const numSelected = this.selection.selected.length;
		const numRows = this.dataSource.data.length;
		return numSelected === numRows;
	}

	masterToggle() {
		this.isAllSelected() ?
			this.selection.clear() :
			this.dataSource.data.forEach(row => this.selection.select(row));
	}

	checkboxLabel(row?: BookingsToAddToInvoiceDialogModel): string {
		if (!row) {
			return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
		}
		return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
	}

	save() {
		var objs = this.selection.selected;
		this.viewLoading = true;
		this.invoiceService.addBookingsToInvoice(objs.map(x=> x.id), this.data).toPromise().then((res) => {
			if (res.success) {
				this.layoutUtilsService.showActionNotification("Changes saved successfully", MessageType.Create);
				this.dialogRef.close(res.data);
			}
		}).catch(() => {
			this.viewLoading = false;
			this.layoutUtilsService.showActionNotification("An error occured while processing your request", MessageType.Create, 3000);
		}).finally(() => {
			this.viewLoading = false;
		});
	}

	ngOnDestroy(): void {
		this.subscriptions.forEach(el => el.unsubscribe());
	}


	applyFilter(filterValue: string) {
		this.dataSource.filter = filterValue.trim().toLowerCase();

		if (this.dataSource.paginator) {
			this.dataSource.paginator.firstPage();
		}
	}

}
