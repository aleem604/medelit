import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { Observable, BehaviorSubject, Subscription, of } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from '../../../../../core/reducers';
import { SubheaderService, LayoutConfigService } from '../../../../../core/_base/layout';
import { LayoutUtilsService, TypesUtilsService } from '../../../../../core/_base/crud';
import {
	InvoicesService,
	InvoiceView
} from '../../../../../core/medelit';
import { NgxSpinnerService } from 'ngx-spinner';
import * as jspdf from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-invoice-view',
	templateUrl: './invoice-view.component.html',
	styleUrls: ['./invoice-view.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoiceViewComponent implements OnInit, OnDestroy {
	// Public properties
	invoice: InvoiceView = new InvoiceView();
	selectedTab = 0;
	loadingSubject = new BehaviorSubject<boolean>(true);
	private componentSubscriptions: Subscription;
	private headerMargin: number;

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
		this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id && id > 0) {
				this.loadInvoiceFromService(id);
			}
		});

		// sticky portlet header
		window.onload = () => {
			const style = getComputedStyle(document.getElementById('kt_header'));
			this.headerMargin = parseInt(style.height, 0);
		};
	}


	loadInvoiceFromService(invoiceId) {
		this.spinner.show();
		this.invoiceService.getInvoiceView(invoiceId).toPromise().then(res => {
			this.invoice = res.data;
			this.cdr.markForCheck();
		})
			.catch(() => {
				this.spinner.hide();
			})
			.finally(() => {
				this.spinner.hide();
				this.initInvoice();
			});
	}

	ngOnDestroy() {
		if (this.componentSubscriptions) {
			this.componentSubscriptions.unsubscribe();
		}
	}

	initInvoice() {
		if (!this.invoice.id) {
			this.subheaderService.setBreadcrumbs([
				{ title: 'Invoices', page: `/invoice-management` },
				{ title: 'Invoices', page: `/invoice-management/invoices` },
				{ title: 'Create invoice', page: `/invoice-management/invoices/add` }
			]);
			return;
		}
		this.subheaderService.setTitle('Edit invoice');
		this.subheaderService.setBreadcrumbs([
			{ title: 'Invoices', page: `/invoice-management` },
			{ title: 'Invoices', page: `/invoice-management/invoices` },
			{ title: 'Edit invoice', page: `/invoice-management/invoices/edit`, queryParams: { id: this.invoice.id } }
		]);
		this.cdr.detectChanges();
	}

	goBack(id) {
		this.loadingSubject.next(false);
		const url = `/invoice-management/invoices`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	goBackWithoutId() {
		this.router.navigateByUrl('/invoice-management/invoices', { relativeTo: this.activatedRoute });
	}


	refreshInvoice(isNew: boolean = false, id = 0) {
		this.loadingSubject.next(false);
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/invoice-management/invoices/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}



	getComponentTitle() {
		let result = 'Create invoice';
		if (!this.invoice || !this.invoice.id) {
			return result;
		}

		result = `INVOICE - ${this.invoice.invoiceNumber}`;
		return result;
	}

	generatePdf() {
		try{
			this.spinner.show();
			let data = document.getElementById('invoice-container');
			html2canvas(data).then(canvas => {
				const contentDataURL = canvas.toDataURL('image/png');
				let pdf = new jspdf('l', 'cm', 'a4'); //Generates PDF in landscape mode
				//let pdf = new jspdf('p', 'cm', 'a4'); //Generates PDF in portrait mode
				pdf.addImage(contentDataURL, 'PNG', 0, 0, 29.7, 21.0);
				pdf.save(`${this.invoice.invoiceNumber}.pdf`);
				window.open(pdf.output('bloburl', { filename: `${this.invoice.invoiceNumber}.pdf` }), '_blank');
		});
	}catch{	
	}
	finally{
		this.spinner.hide();
	}
	}

	generatePdf1() {
		//const fileName = String(new Date().valueOf());
		
		try {
			const fileName = `${this.invoice.subject}-${this.invoice.invoiceNumber}`;
			const element: HTMLElement = document.querySelector('#invoice-container');
			const regionCanvas = element.getBoundingClientRect();
			html2canvas(element, { scale: 3 }).then(async canvas => {				
				const pdf = new jspdf('p', 'mm', 'a4');
				pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 3, 0, 205, (205 / regionCanvas.width) * regionCanvas.height);
				await pdf.save(fileName, { returnPromise: true });
				window.open(pdf.output('bloburl', { filename: fileName }), '_blank');
			});
		} catch(e){
			console.log(e);
		} 
	}

	getMilliSeconds(date: string): any {
		try {
			if (date) {
				if (date.indexOf('Z') === -1) {
					date = date + 'Z';
					return new Date(date).getTime();
				}
			}
		} catch {

		}
		const tdate = new Date();
		const utc = new Date(
			tdate.getUTCFullYear(),
			tdate.getUTCMonth(),
			tdate.getUTCDate(),
			tdate.getUTCHours(),
			tdate.getUTCMinutes(),
			tdate.getUTCSeconds(),
		);

		return utc.getTime();
	}


}
