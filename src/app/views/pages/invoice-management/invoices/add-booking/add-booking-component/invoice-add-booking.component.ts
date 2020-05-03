import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ChangeDetectorRef, Input } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import * as _ from 'lodash';
import { InvoicesService, ApiResponse, EditInvoiceBookingsViewModel, InvoiceBookings, FilterModel } from '../../../../../../core/medelit';
import { LayoutConfigService, SubheaderService } from '../../../../../../core/_base/layout';
import { LayoutUtilsService, TypesUtilsService, MessageType } from '../../../../../../core/_base/crud';
import { MatDialog } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from '../../../../../../core/reducers';
import { ConfirmDialogModel, ConfirmDialogComponent } from '../../../../../partials/confirm-dialog/confirm-dialog.component';
import { AddBookingToInvoiceDialog } from '../add-booking-to-invoice-dialog/add-booking-to-invoice.dialog';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'invoice-add-booking',
	templateUrl: './invoice-add-booking.component.html',
	styleUrls: ['./invoice-add-booking.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoiceAddbookingComponent implements OnInit, OnDestroy {
	@Input() invoiceId: number;
	orgViewModel: EditInvoiceBookingsViewModel[] = [];
	viewModel: EditInvoiceBookingsViewModel[] =[];
	inoviceTotal: string;
	isLoading: boolean = false

	constructor(
		private store: Store<AppState>,
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private typesUtilsService: TypesUtilsService,
		public dialog: MatDialog,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private layoutConfigService: LayoutConfigService,
		private invoiceService: InvoicesService,
		private spinner: NgxSpinnerService,
		private cdr: ChangeDetectorRef) {
	}

	ngOnInit() {
		if (this.invoiceId)
			this.loadInvoiceBookings();
	}

	loadInvoiceBookings() {
		this.isLoading = true;
		this.invoiceService.getInvocieBookingsForCrud(this.invoiceId).toPromise().then(res => {
			this.spinner.hide();
			let data = res as unknown as ApiResponse;
			if (data.success) {
				this.viewModel = res.data as EditInvoiceBookingsViewModel[] || [];
				this.orgViewModel = JSON.parse(JSON.stringify(this.viewModel)) as EditInvoiceBookingsViewModel[];
				this.inoviceTotal = this.viewModel && this.viewModel.length > 0 ? _.first(this.viewModel).inoviceTotal : '';
				this.cdr.markForCheck();
			}
		}).catch((e) => {
			this.isLoading = false;
		}).finally(() => {
			this.isLoading = false;
		});
	}

	saveChanges() {
		this.isLoading = true;
		var data = this.viewModel.map(m => { return  { id: m.id, value: m.itemNameOnInvoice } }) as unknown as FilterModel[];
		this.invoiceService.saveInvocieBookingsForCrud(data, this.invoiceId).toPromise().then((res) => {
			if (res.success) {
				this.layoutUtilsService.showActionNotification('Booking saved successfully.', MessageType.Create, 3000, true);

				this.viewModel = res.data as EditInvoiceBookingsViewModel[];
				this.orgViewModel = JSON.parse(JSON.stringify(this.viewModel)) as EditInvoiceBookingsViewModel[];
				this.inoviceTotal = this.viewModel && this.viewModel.length > 0 ? _.first(this.viewModel).inoviceTotal : '';
				this.cdr.markForCheck();
			}
		}).catch(() => {
			this.isLoading = false;
		}).finally(() => {
			this.isLoading = false;
		});
	}

	ngOnDestroy() {
		
	}
	
	/*End Filters Section*/

	addBooking() {
		const dialogRef = this.dialog.open(AddBookingToInvoiceDialog, {
			data: this.invoiceId
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				this.loadInvoiceBookings();
			}
		});
	}

	deleteBookingFromInvoice(bookingId: number) {
		const message = `Are you sure you want to remove this booking from invoice?`;
		const dialogData = new ConfirmDialogModel("Confirm", message);

		const dialogRef = this.dialog.open(ConfirmDialogComponent, {
			maxWidth: "300px",
			data: dialogData
		});

		dialogRef.afterClosed().subscribe(dialogResult => {
			if (dialogResult) {
				this.isLoading = true;
				this.cdr.markForCheck();
				this.invoiceService.deleteInvoiceBooking(this.invoiceId, bookingId).toPromise().then((res) => {
					if (res.success) {
						this.layoutUtilsService.showActionNotification('Booking removed successfully.', MessageType.Create, 3000, true);
						this.loadInvoiceBookings();
					}
				}).catch(() => {
					this.isLoading = false;
				}).finally(() => {					
				});
			}
		});
	}
    
	showSave() {
		if (JSON.stringify(this.viewModel) === JSON.stringify(this.orgViewModel)) {
			return false;
		}
		return true;
	}

}
