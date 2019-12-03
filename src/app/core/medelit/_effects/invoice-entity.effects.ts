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
import { InvoiceEntitiesService } from '../_services/';
// State
import { AppState } from '../../../core/reducers';
// Actions
import {
    InvoiceEntityActionTypes,
    InvoiceEntitiesPageRequested,
    InvoiceEntitiesPageLoaded,
    ManyInvoiceEntitiesDeleted,
    OneInvoiceEntityDeleted,
    InvoiceEntityActionToggleLoading,
    InvoiceEntitiesPageToggleLoading,
    InvoiceEntityUpdated,
    InvoiceEntitiesStatusUpdated,
    InvoiceEntityCreated,
    InvoiceEntityOnServerCreated
} from '../_actions/invoice-entity.actions';
import { of } from 'rxjs';

@Injectable()
export class InvoiceEntityEffects {
    showPageLoadingDistpatcher = new InvoiceEntitiesPageToggleLoading({ isLoading: true });
    showActionLoadingDistpatcher = new InvoiceEntityActionToggleLoading({ isLoading: true });
    hideActionLoadingDistpatcher = new InvoiceEntityActionToggleLoading({ isLoading: false });

    @Effect()
    loadInvoiceEntitiesPage$ = this.actions$.pipe(
        ofType<InvoiceEntitiesPageRequested>(InvoiceEntityActionTypes.InvoiceEntitiesPageRequested),
        mergeMap(( { payload } ) => {
            this.store.dispatch(this.showPageLoadingDistpatcher);
            const requestToServer = this.invoiceEntitysService.findInvoiceEntities(payload.page);
            const lastQuery = of(payload.page);
            return forkJoin(requestToServer, lastQuery);
        }),
        map(response => {
            const result: QueryResultsModel = response[0].data;
            const lastQuery: QueryParamsModel = response[1];
            const pageLoadedDispatch = new InvoiceEntitiesPageLoaded({
                entities: result.items,
                totalCount: result.totalCount,
                page: lastQuery
            });
            return pageLoadedDispatch;
        })
    );

    @Effect()
    deleteInvoiceEntity$ = this.actions$
        .pipe(
            ofType<OneInvoiceEntityDeleted>(InvoiceEntityActionTypes.OneInvoiceEntityDeleted),
            mergeMap(( { payload } ) => {
                    this.store.dispatch(this.showActionLoadingDistpatcher);
                    return this.invoiceEntitysService.deleteInvoiceEntity(payload.id);
                }
            ),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            }),
        );

    @Effect()
    deleteInvoiceEntities$ = this.actions$
        .pipe(
            ofType<ManyInvoiceEntitiesDeleted>(InvoiceEntityActionTypes.ManyInvoiceEntitiesDeleted),
            mergeMap(( { payload } ) => {
                    this.store.dispatch(this.showActionLoadingDistpatcher);
                    return this.invoiceEntitysService.deleteInvoiceEntities(payload.ids);
                }
            ),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            }),
        );

    @Effect()
    updateInvoiceEntity$ = this.actions$
        .pipe(
            ofType<InvoiceEntityUpdated>(InvoiceEntityActionTypes.InvoiceEntityUpdated),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showActionLoadingDistpatcher);
                return this.invoiceEntitysService.updateInvoiceEntity(payload.entity);
            }),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            })
        );

    @Effect()
    updateInvoiceEntitiesStatus$ = this.actions$
        .pipe(
            ofType<InvoiceEntitiesStatusUpdated>(InvoiceEntityActionTypes.InvoiceEntitiesStatusUpdated),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showActionLoadingDistpatcher);
                return this.invoiceEntitysService.updateStatusForInvoiceEntity(payload.entities, payload.status);
            }),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            })
        );

    @Effect()
    createInvoiceEntity$ = this.actions$
        .pipe(
            ofType<InvoiceEntityOnServerCreated>(InvoiceEntityActionTypes.InvoiceEntityOnServerCreated),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showActionLoadingDistpatcher);
                return this.invoiceEntitysService.createInvoiceEntity(payload.entity).pipe(
                    tap(res => {
                        this.store.dispatch(new InvoiceEntityCreated({ entity: res }));
                    })
                );
            }),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            }),
        );

    constructor(private actions$: Actions, private invoiceEntitysService: InvoiceEntitiesService, private store: Store<AppState>) { }
}
