import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
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
import * as $ from 'jquery';


@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-invoice-view',
	templateUrl: './invoice-view.component.html',
	styleUrls: ['./invoice-view.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoiceViewComponent implements OnInit, OnDestroy {
	// Public properties
	@ViewChild('content', { static: true }) content: ElementRef;
	invoice: InvoiceView = new InvoiceView();
	selectedTab = 0;
	loadingSubject = new BehaviorSubject<boolean>(true);
	private componentSubscriptions: Subscription;
	private headerMargin: number;

	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		public dialog: MatDialog,
		private subheaderService: SubheaderService,
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

	dowonloadPdf() {
		try {
			window.scroll(0, 0);
			const fileName = `${this.invoice.invoiceNumber}.pdf`;
			this.spinner.show();
			let data = document.getElementById('container');
			html2canvas(data).then(canvas => {
				const contentDataURL = canvas.toDataURL('image/jpeg', 1.0);
				let pdf = new jspdf('p', 'cm', 'a4');
				pdf.addImage(contentDataURL, 'jpeg', 0, 1, 20.7, 17.0);
				pdf.save(fileName);
				window.open(pdf.output('bloburl', { filename: fileName }), '_blank');
			});
		}
		catch{
		}
		finally {
			this.spinner.hide();
		}
	}

	generatePdf() {
		const elem = document.getElementById('container');
		const fileName = `${this.invoice.invoiceNumber}.pdf`;

		var divHeight = $(elem).height();
		var divWidth = $(elem).width();
		var ratio = divHeight / divWidth;
		let data = document.getElementById('container');
		html2canvas(data).then(canvas => {
			var imgData = canvas.toDataURL('image/jpeg', 1.0);
			let pdf = new jspdf("l", "mm", "a4");
			pdf.addImage(imgData, 'JPEG', 10, 10, 170, 150);
			pdf.save(fileName);
			window.open(pdf.output('bloburl', { filename: fileName }), '_blank');
		});
	}

	createPdf() {
		const fileName = `${this.invoice.invoiceNumber}.pdf`;
		var pdf = new jspdf('p', 'pt', 'a4');
		const source = document.getElementById('container');
		const specialElementHandlers = {
			'#bypassme': function (element, renderer) {
				return true
			}
		};
		const margins = {
			top: 30,
			bottom: 30,
			left: 20,
			width: 790,
			height: 1122
		};

		pdf.fromHTML(
			source,
			margins.left,
			margins.top, {
			'width': margins.width,
			'elementHandlers': specialElementHandlers
		},

			function (dispose) {
				pdf.save(fileName);
				window.open(pdf.output('bloburl', { filename: fileName }), '_blank');
			}, margins);
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
