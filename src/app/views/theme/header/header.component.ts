// Angular
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
	NavigationCancel,
	NavigationEnd,
	NavigationStart,
	RouteConfigLoadEnd,
	RouteConfigLoadStart,
	Router
} from '@angular/router';
// Object-Path
import * as objectPath from 'object-path';
// Loading bar
import { LoadingBarService } from '@ngx-loading-bar/core';
// Layout
import { LayoutConfigService, LayoutRefService } from '../../../core/_base/layout';
// HTML Class Service
import { HtmlClassService } from '../html-class.service';


@Component({
	selector: 'kt-header',
	templateUrl: './header.component.html',
	styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, AfterViewInit {
	// Public properties
	menuHeaderDisplay: boolean;
	fluid: boolean;

	@ViewChild('ktHeader', {static: true}) ktHeader: ElementRef;

	constructor(
		private router: Router,
		private layoutRefService: LayoutRefService,
		private layoutConfigService: LayoutConfigService,
		public loader: LoadingBarService,
		public htmlClassService: HtmlClassService
	) {
		// page progress bar percentage
		this.router.events.subscribe(event => {
			if (event instanceof NavigationStart) {
				// set page progress bar loading to start on NavigationStart event router
				this.loader.start();
			}
			if (event instanceof RouteConfigLoadStart) {
				this.loader.increment(35);
			}
			if (event instanceof RouteConfigLoadEnd) {
				this.loader.increment(75);
			}
			if (event instanceof NavigationEnd || event instanceof NavigationCancel) {
				// set page progress bar loading to end on NavigationEnd event router
				this.loader.complete();
			}
		});
	}

	ngOnInit(): void {
		const config = this.layoutConfigService.getConfig();

		this.menuHeaderDisplay = objectPath.get(config, 'header.menu.self.display');

		this.fluid = objectPath.get(config, 'header.self.width') === 'fluid';
	}

	ngAfterViewInit(): void {
		this.layoutRefService.addElement('header', this.ktHeader.nativeElement);
	}
}
