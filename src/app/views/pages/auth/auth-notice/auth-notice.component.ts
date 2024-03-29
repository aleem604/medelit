// Angular
import { ChangeDetectorRef, Component, OnDestroy, OnInit, Output } from '@angular/core';
// RxJS
import { Subscription } from 'rxjs';
// Auth
import { AuthNotice, AuthNoticeService } from '../../../../core/auth/';

@Component({
	selector: 'kt-auth-notice',
	templateUrl: './auth-notice.component.html',
	styleUrls: ['./auth-notice.component.scss']
})
export class AuthNoticeComponent implements OnInit, OnDestroy {
	@Output() type: any;
	@Output() message: any = '';

	// Private properties
	private subscriptions: Subscription[] = [];

	constructor(public authNoticeService: AuthNoticeService, private cdr: ChangeDetectorRef) {
	}

	ngOnInit() {
		this.subscriptions.push(this.authNoticeService.onNoticeChanged$.subscribe(
			(notice: AuthNotice) => {
				notice = Object.assign({}, {message: '', type: ''}, notice);
				this.message = notice.message;
				this.type = notice.type;
				this.cdr.markForCheck();
			}
		));
	}

	ngOnDestroy(): void {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
}
