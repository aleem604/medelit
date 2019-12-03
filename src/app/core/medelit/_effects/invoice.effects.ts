import { QueryParamsModel } from './../../_base/crud/models/query-models/query-params.model';
import { forkJoin } from 'rxjs';
// Angular
import { Injectable } from '@angular/core';
// RxJS
import { mergeMap, map, tap, delay } from 'rxjs/operators';
// NGRX
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
// CRUD
import { QueryResultsModel } from '../../_base/crud';
// Services
import { InvoicesService } from '../_services/';
// State
import { AppState } from '../../../core/reducers';
// Actions
import {
    InvoiceActionTypes,
    InvoicesPageRequested,
    InvoicesPageLoaded,
    ManyInvoicesDeleted,
    OneInvoiceDeleted,
    InvoiceActionToggleLoading,
    InvoicesPageToggleLoading,
    InvoiceUpdated,
    InvoicesStatusUpdated,
    InvoiceCreated,
    InvoiceOnServerCreated
} from '../_actions/invoice.actions';
import { of } from 'rxjs';

@Injectable()
export class InvoiceEffects {
    showPageLoadingDistpatcher = new InvoicesPageToggleLoading({ isLoading: true });
    showActionLoadingDistpatcher = new InvoiceActionToggleLoading({ isLoading: true });
    hideActionLoadingDistpatcher = new InvoiceActionToggleLoading({ isLoading: false });

    @Effect()
    loadInvoicesPage$ = this.actions$.pipe(
        ofType<InvoicesPageRequested>(InvoiceActionTypes.InvoicesPageRequested),
        mergeMap(( { payload } ) => {
            this.store.dispatch(this.showPageLoadingDistpatcher);
            const requestToServer = this.invoicesService.findInvoices(payload.page);
            const lastQuery = of(payload.page);
            return forkJoin(requestToServer, lastQuery);
        }),
        map(response => {
            const result: QueryResultsModel = response[0].data;
            const lastQuery: QueryParamsModel = response[1];
            const pageLoadedDispatch = new InvoicesPageLoaded({
                invoices: result.items,
                totalCount: result.totalCount,
                page: lastQuery
            });
            return pageLoadedDispatch;
        })
    );

    @Effect()
    deleteInvoice$ = this.actions$
        .pipe(
            ofType<OneInvoiceDeleted>(InvoiceActionTypes.OneInvoiceDeleted),
            mergeMap(( { payload } ) => {
                    this.store.dispatch(this.showActionLoadingDistpatcher);
                    return this.invoicesService.deleteInvoice(payload.id);
                }
            ),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            }),
        );

    @Effect()
    deleteInvoices$ = this.actions$
        .pipe(
            ofType<ManyInvoicesDeleted>(InvoiceActionTypes.ManyInvoicesDeleted),
            mergeMap(( { payload } ) => {
                    this.store.dispatch(this.showActionLoadingDistpatcher);
                    return this.invoicesService.deleteInvoices(payload.ids);
                }
            ),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            }),
        );

    @Effect()
    updateInvoice$ = this.actions$
        .pipe(
            ofType<InvoiceUpdated>(InvoiceActionTypes.InvoiceUpdated),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showActionLoadingDistpatcher);
                return this.invoicesService.updateInvoice(payload.invoice);
            }),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            })
        );

    @Effect()
    updateInvoicesStatus$ = this.actions$
        .pipe(
            ofType<InvoicesStatusUpdated>(InvoiceActionTypes.InvoicesStatusUpdated),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showActionLoadingDistpatcher);
                return this.invoicesService.updateStatusForInvoice(payload.invoices, payload.status);
            }),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            })
        );

    @Effect()
    createInvoice$ = this.actions$
        .pipe(
            ofType<InvoiceOnServerCreated>(InvoiceActionTypes.InvoiceOnServerCreated),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showActionLoadingDistpatcher);
                return this.invoicesService.createInvoice(payload.invoice).pipe(
                    tap(res => {
                        this.store.dispatch(new InvoiceCreated({ invoice: res }));
                    })
                );
            }),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            }),
        );

    constructor(private actions$: Actions, private invoicesService: InvoicesService, private store: Store<AppState>) { }
}
