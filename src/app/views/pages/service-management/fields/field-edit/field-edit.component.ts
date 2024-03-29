// Angular
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// Material
import { MatDialog } from '@angular/material';
// RxJS
import { Observable, BehaviorSubject, Subscription, of } from 'rxjs';
import { map, startWith, delay, first } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
import { Dictionary, Update } from '@ngrx/entity';
import { AppState } from '../../../../../core/reducers';
// Layout
import { SubheaderService, LayoutConfigService } from '../../../../../core/_base/layout';
// CRUD
import { LayoutUtilsService, TypesUtilsService, MessageType } from '../../../../../core/_base/crud';
// Services and Models
import {
	selectLastCreatedProductId,
	selectProductById,
	SPECIFICATIONS_DICTIONARY,
	ProductOnServerCreated,
	ProductUpdated,
	ProductsService,
    ProductModel
} from '../../../../../core/medelit';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-field-edit',
	templateUrl: './field-edit.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldEditComponent implements OnInit, OnDestroy {
	product: ProductModel;
	productId$: Observable<number>;
	oldProduct: ProductModel;
	selectedTab = 0;
	loadingSubject = new BehaviorSubject<boolean>(true);
	loading$: Observable<boolean>;
	productForm: FormGroup;
	hasFormErrors = false;
	availableYears: number[] = [];
	filteredColors: Observable<string[]>;
	filteredManufactures: Observable<string[]>;
	private componentSubscriptions: Subscription;
	private headerMargin: number;

	constructor(
		private store: Store<AppState>,
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private typesUtilsService: TypesUtilsService,
		private productFB: FormBuilder,
		public dialog: MatDialog,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private layoutConfigService: LayoutConfigService,
		private productService: ProductsService,
		private cdr: ChangeDetectorRef) {
	}

	ngOnInit() {
		this.loading$ = this.loadingSubject.asObservable();
		this.loadingSubject.next(true);
		this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id && id > 0) {

				this.store.pipe(
					select(selectProductById(id))
				).subscribe(result => {
					if (!result) {
						this.loadProductFromService(id);
						return;
					}

					this.loadProduct(result);
				});
			} else {
				const newProduct = new ProductModel();
				newProduct.clear();
				this.loadProduct(newProduct);
			}
		});

		// sticky portlet header
		window.onload = () => {
			const style = getComputedStyle(document.getElementById('kt_header'));
			this.headerMargin = parseInt(style.height, 0);
		};
	}

	loadProduct(_product, fromService: boolean = false) {
		if (!_product) {
			this.goBack('');
		}
		this.product = _product;
		this.productId$ = of(_product.id);
		this.oldProduct = Object.assign({}, _product);
		this.initProduct();
		if (fromService) {
			this.cdr.detectChanges();
		}
	}

	// If product didn't find in store
	loadProductFromService(productId) {
		this.productService.getProductById(productId).subscribe(res => {
			this.loadProduct(res, true);
		});
	}

	/**
	 * On destroy
	 */
	ngOnDestroy() {
		if (this.componentSubscriptions) {
			this.componentSubscriptions.unsubscribe();
		}
	}

	/**
	 * Init product
	 */
	initProduct() {
		this.createForm();
		this.loadingSubject.next(false);
		if (!this.product.id) {
			this.subheaderService.setBreadcrumbs([
				{ title: 'Field', page: `/service-management` },
				{ title: 'Fields', page: `/service-management/fields` },
				{ title: 'Create field', page: `/service-management/fields/add` }
			]);
			return;
		}
		this.subheaderService.setTitle('Edit field');
		this.subheaderService.setBreadcrumbs([
			{ title: 'Field Management', page: `/service-management` },
			{ title: 'Fields', page: `/service-management/fields` },
			{ title: 'Edit field', page: `/service-management/fields/edit`, queryParams: { id: this.product.id } }
		]);
	}

	/**
	 * Create form
	 */
	createForm() {
		this.productForm = this.productFB.group({
			model: [this.product.model, Validators.required],
			manufacture: [this.product.manufacture, Validators.required],
			modelYear: [this.product.modelYear.toString(), Validators.required],
			mileage: [this.product.mileage, [Validators.required, Validators.pattern(/^-?(0|[1-9]\d*)?$/)]],
			description: [this.product.description],
			color: [this.product.color, Validators.required],
			price: [this.product.price, [Validators.required, Validators.pattern(/^-?(0|[1-9]\d*)?$/)]],
			condition: [this.product.condition.toString(), [Validators.required, Validators.min(0), Validators.max(1)]],
			status: [this.product.status.toString(), [Validators.required, Validators.min(0), Validators.max(1)]],
			VINCode: [this.product.VINCode, Validators.required]
		});		
	}

	goBack(id) {
		this.loadingSubject.next(false);
		const url = `/service-management/fields?id=${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	goBackWithoutId() {
		this.router.navigateByUrl('/service-management/fields', { relativeTo: this.activatedRoute });
	}

	refreshProduct(isNew: boolean = false, id = 0) {
		this.loadingSubject.next(false);
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/service-management/fields/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	/**
	 * Reset
	 */
	reset() {
		this.product = Object.assign({}, this.oldProduct);
		this.createForm();
		this.hasFormErrors = false;
		this.productForm.markAsPristine();
		this.productForm.markAsUntouched();
		this.productForm.updateValueAndValidity();
	}

	/**
	 * Save data
	 *
	 * @param withBack: boolean
	 */
	onSumbit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.productForm.controls;
		/** check form */
		if (this.productForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			window.scroll(0, 0);
			return;
		}

		// tslint:disable-next-line:prefer-const
		let editedProduct = this.prepareProduct();

		if (editedProduct.id > 0) {
			this.updateProduct(editedProduct, withBack);
			return;
		}

		this.addProduct(editedProduct, withBack);
	}

	/**
	 * Returns object for saving
	 */
	prepareProduct(): ProductModel {
		const controls = this.productForm.controls;
		const _product = new ProductModel();
		_product.id = this.product.id;
		_product.model = controls.model.value;
		_product.manufacture = controls.manufacture.value;
		_product.modelYear = +controls.modelYear.value;
		_product.mileage = +controls.mileage.value;
		_product.description = controls.description.value;
		_product.color = controls.color.value;
		_product.price = +controls.price.value;
		_product.condition = +controls.condition.value;
		_product.status = +controls.status.value;
		_product.VINCode = controls.VINCode.value;
		_product._userId = 1; // TODO: get version from userId
		_product._createdDate = this.product._createdDate;
		_product._updatedDate = this.product._updatedDate;
		_product._updatedDate = this.typesUtilsService.getDateStringFromDate();
		_product._createdDate = this.product.id > 0 ? _product._createdDate : _product._updatedDate;
		return _product;
	}

	/**
	 * Add product
	 *
	 * @param _product: ProductModel
	 * @param withBack: boolean
	 */
	addProduct(_product: ProductModel, withBack: boolean = false) {
		this.loadingSubject.next(true);
		this.store.dispatch(new ProductOnServerCreated({ product: _product }));
		this.componentSubscriptions = this.store.pipe(
			delay(1000),
			select(selectLastCreatedProductId)
		).subscribe(newId => {
			if (!newId) {
				return;
			}

			this.loadingSubject.next(false);
			if (withBack) {
				this.goBack(newId);
			} else {
				const message = `New field successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 10000, true, true);
				this.refreshProduct(true, newId);
			}
		});
	}

	/**
	 * Update product
	 *
	 * @param _product: ProductModel
	 * @param withBack: boolean
	 */
	updateProduct(_product: ProductModel, withBack: boolean = false) {
		this.loadingSubject.next(true);

		const updateProduct: Update<ProductModel> = {
			id: _product.id,
			changes: _product
		};

		this.store.dispatch(new ProductUpdated({
			partialProduct: updateProduct,
			product: _product
		}));

		of(undefined).pipe(delay(3000)).subscribe(() => { // Remove this line
			if (withBack) {
				this.goBack(_product.id);
			} else {
				const message = `Field successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 10000, true, true);
				this.refreshProduct(false);
			}
		}); // Remove this line
	}

	/**
	 * Returns component title
	 */
	getComponentTitle() {
		let result = 'Create field';
		if (!this.product || !this.product.id) {
			return result;
		}

		result = `Edit field - ${this.product.manufacture} ${this.product.model}, ${this.product.modelYear}`;
		return result;
	}

	/**
	 * Close alert
	 *
	 * @param $event
	 */
	onAlertClose($event) {
		this.hasFormErrors = false;
	}
}
