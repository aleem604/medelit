// Angular
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { JwtHelperService } from "@auth0/angular-jwt";
// RxJS
import { Observable, Subject } from 'rxjs';
import { finalize, takeUntil, tap } from 'rxjs/operators';
// Translate
import { TranslateService } from '@ngx-translate/core';
// Store
import { Store } from '@ngrx/store';
import { AppState } from '../../../../core/reducers';
// Auth
import { AuthNoticeService, AuthService, Login, UserLoaded, Logout } from '../../../../core/auth';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../core/medelit';

/**
 * ! Just example => Should be removed in development
 */
//const DEMO_PARAMS = {
//	EMAIL: 'admin@demo.com',
//	PASSWORD: 'demo'
//};
const DEMO_PARAMS = {
	EMAIL: '',
	PASSWORD: ''
};


@Component({
	selector: 'kt-login',
	templateUrl: './login.component.html',
	encapsulation: ViewEncapsulation.None
})
export class LoginComponent implements OnInit, OnDestroy {
	// Public params
	loginForm: FormGroup;
	loading = false;
	isLoggedIn$: Observable<boolean>;
	errors: any = [];

	private unsubscribe: Subject<any>;

	private returnUrl: any;

	constructor(
		private router: Router,
		private auth: AuthService,
		private authNoticeService: AuthNoticeService,
		private translate: TranslateService,
		private store: Store<AppState>,
		private fb: FormBuilder,
		private cdr: ChangeDetectorRef,
		private route: ActivatedRoute,
		private helper: JwtHelperService
	) {
		this.unsubscribe = new Subject();
		if (!environment.production) {
			DEMO_PARAMS.EMAIL = 'medelitadmin@gmail.com';
			DEMO_PARAMS.PASSWORD = 'Password!1';
		}
	}

	ngOnInit(): void {
		this.initLoginForm();

		// redirect back to the returnUrl before login
		this.route.queryParams.subscribe(params => {
			this.returnUrl = params.returnUrl || '/';
		});
	}

	ngOnDestroy(): void {
		this.authNoticeService.setNotice(null);
		this.unsubscribe.next();
		this.unsubscribe.complete();
		this.loading = false;
	}

	initLoginForm() {
		// demo message to show
		if (!this.authNoticeService.onNoticeChanged$.getValue()) {
			const initialNotice = `Use your account email
			<strong>${DEMO_PARAMS.EMAIL}</strong> and password
			<strong>${DEMO_PARAMS.PASSWORD}</strong> to continue.`;
			this.authNoticeService.setNotice(initialNotice, 'info');
		}

		this.loginForm = this.fb.group({
			email: [DEMO_PARAMS.EMAIL, Validators.compose([
				Validators.required,
				Validators.email,
				Validators.minLength(3),
				Validators.maxLength(320)
			])
			],
			password: [DEMO_PARAMS.PASSWORD, Validators.compose([
				Validators.required,
				Validators.minLength(3),
				Validators.maxLength(100)
			])
			]
		});
	}

	/**
	 * Form Submit
	 */
	submit() {
		const controls = this.loginForm.controls;
		/** check form */
		if (this.loginForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);
			return;
		}

		this.loading = true;

		const authData = {
			email: controls.email.value,
			password: controls.password.value
		};
		this.auth
			.login(authData.email, authData.password)
			.pipe(
				tap(res => {
					const resp = (res as unknown as ApiResponse);

					if (resp.success && resp.data) {
						this.store.dispatch(new Login({ authToken: resp.data.accessToken }));
						var token = this.helper.decodeToken(resp.data.accessToken);
						var userInfo = token.user_info;
						if (userInfo) {
							var currentUser = JSON.parse(userInfo);
							this.store.dispatch(new UserLoaded({ user: currentUser }));
						} else {
							this.store.dispatch(new Logout());
						}

						if (this.returnUrl) {
							var parts = this.returnUrl.split('returnUrl');
							const newUrl = parts[0] + 'returnUrl' + parts[1];
							this.returnUrl = newUrl;
						}
						this.router.navigateByUrl(this.returnUrl);
					} else {
						this.authNoticeService.setNotice(this.translate.instant('AUTH.VALIDATION.INVALID_LOGIN'), 'danger');
					}
				}),
				takeUntil(this.unsubscribe),
				finalize(() => {
					this.loading = false;
					this.cdr.markForCheck();
				})
			)
			.subscribe();
	}

	isControlHasError(controlName: string, validationType: string): boolean {
		const control = this.loginForm.controls[controlName];
		if (!control) {
			return false;
		}

		const result = control.hasError(validationType) && (control.dirty || control.touched);
		return result;
	}
}
