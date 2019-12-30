import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { LayoutConfigService } from '../../../core/_base/layout';
import { NgxSpinnerService } from 'ngx-spinner';
import { DashboardService, DashboardModel } from '../../../core/medelit';
import { Observable, pipe } from 'rxjs';
import { map } from 'rxjs/operators';


@Component({
	selector: 'kt-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['dashboard.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {
	stats: DashboardModel = new DashboardModel();

	constructor(private layoutConfigService: LayoutConfigService,
		private spinner: NgxSpinnerService,
		private dashbardService: DashboardService,
	private cdr: ChangeDetectorRef) {
	}

	ngOnInit(): void {
		this.spinner.show();
		this.dashbardService.getStats().pipe(
			map(res => res.data)
		).toPromise().then((res) => {
			this.spinner.hide();
			this.stats = res;
			this.detectChanges();
		}).catch((e) => {
			this.spinner.hide();
			console.log(e);
		});

	}


	detectChanges() {
		try {
			this.cdr.detectChanges();
		}catch{

		}
	}


}
