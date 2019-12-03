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
import { FeesService } from '../_services/';
// State
import { AppState } from '../../../core/reducers';
// Actions
import {
    FeeActionTypes,
    FeesPageRequested,
    FeesPageLoaded,
    ManyFeesDeleted,
    OneFeeDeleted,
    FeeActionToggleLoading,
    FeesPageToggleLoading,
    FeeUpdated,
    FeesStatusUpdated,
    FeeCreated,
    FeeOnServerCreated
} from '../_actions/fee.actions';
import { of } from 'rxjs';

@Injectable()
export class FeeEffects {
    showPageLoadingDistpatcher = new FeesPageToggleLoading({ isLoading: true });
    showActionLoadingDistpatcher = new FeeActionToggleLoading({ isLoading: true });
    hideActionLoadingDistpatcher = new FeeActionToggleLoading({ isLoading: false });

    @Effect()
    loadFeesPage$ = this.actions$.pipe(
        ofType<FeesPageRequested>(FeeActionTypes.FeesPageRequested),
        mergeMap(( { payload } ) => {
            this.store.dispatch(this.showPageLoadingDistpatcher);
            const requestToServer = this.feesService.findFees(payload.page);
            const lastQuery = of(payload.page);
            return forkJoin(requestToServer, lastQuery);
        }),
        map(response => {
            const result: QueryResultsModel = response[0].data;
            const lastQuery: QueryParamsModel = response[1];
            const pageLoadedDispatch = new FeesPageLoaded({
                fees: result.items,
                totalCount: result.totalCount,
                page: lastQuery
            });
            return pageLoadedDispatch;
        })
    );

    @Effect()
    deleteFee$ = this.actions$
        .pipe(
            ofType<OneFeeDeleted>(FeeActionTypes.OneFeeDeleted),
            mergeMap(( { payload } ) => {
                    this.store.dispatch(this.showActionLoadingDistpatcher);
                    return this.feesService.deleteFee(payload.id);
                }
            ),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            }),
        );

    @Effect()
    deleteFees$ = this.actions$
        .pipe(
            ofType<ManyFeesDeleted>(FeeActionTypes.ManyFeesDeleted),
            mergeMap(( { payload } ) => {
                    this.store.dispatch(this.showActionLoadingDistpatcher);
                    return this.feesService.deleteFees(payload.ids);
                }
            ),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            }),
        );

    @Effect()
    updateFee$ = this.actions$
        .pipe(
            ofType<FeeUpdated>(FeeActionTypes.FeeUpdated),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showActionLoadingDistpatcher);
                return this.feesService.updateFee(payload.fee);
            }),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            })
        );

    @Effect()
    updateFeesStatus$ = this.actions$
        .pipe(
            ofType<FeesStatusUpdated>(FeeActionTypes.FeesStatusUpdated),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showActionLoadingDistpatcher);
                return this.feesService.updateStatusForFee(payload.fees, payload.status);
            }),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            })
        );

    @Effect()
    createFee$ = this.actions$
        .pipe(
            ofType<FeeOnServerCreated>(FeeActionTypes.FeeOnServerCreated),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showActionLoadingDistpatcher);
                return this.feesService.createFee(payload.fee).pipe(
                    tap(res => {
                        this.store.dispatch(new FeeCreated({ fee: res }));
                    })
                );
            }),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            }),
        );

    constructor(private actions$: Actions, private feesService: FeesService, private store: Store<AppState>) { }
}
