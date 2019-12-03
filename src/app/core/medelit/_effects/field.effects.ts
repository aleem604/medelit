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
import { FieldsService } from '../_services/';
// State
import { AppState } from '../../../core/reducers';
// Actions
import {
    FieldActionTypes,
    FieldsPageRequested,
    FieldsPageLoaded,
    ManyFieldsDeleted,
    OneFieldDeleted,
    FieldActionToggleLoading,
    FieldsPageToggleLoading,
    FieldUpdated,
    FieldsStatusUpdated,
    FieldCreated,
    FieldOnServerCreated
} from '../_actions/field.actions';
import { of } from 'rxjs';

@Injectable()
export class FieldEffects {
    showPageLoadingDistpatcher = new FieldsPageToggleLoading({ isLoading: true });
    showActionLoadingDistpatcher = new FieldActionToggleLoading({ isLoading: true });
    hideActionLoadingDistpatcher = new FieldActionToggleLoading({ isLoading: false });

    @Effect()
    loadFieldsPage$ = this.actions$.pipe(
        ofType<FieldsPageRequested>(FieldActionTypes.FieldsPageRequested),
        mergeMap(( { payload } ) => {
            this.store.dispatch(this.showPageLoadingDistpatcher);
            const requestToServer = this.fieldsService.findFields(payload.page);
            const lastQuery = of(payload.page);
            return forkJoin(requestToServer, lastQuery);
        }),
        map(response => {
            const result: QueryResultsModel = response[0].data;
            const lastQuery: QueryParamsModel = response[1];
            const pageLoadedDispatch = new FieldsPageLoaded({
                fields: result.items,
                totalCount: result.totalCount,
                page: lastQuery
            });
            return pageLoadedDispatch;
        })
    );

    @Effect()
    deleteField$ = this.actions$
        .pipe(
            ofType<OneFieldDeleted>(FieldActionTypes.OneFieldDeleted),
            mergeMap(( { payload } ) => {
                    this.store.dispatch(this.showActionLoadingDistpatcher);
                    return this.fieldsService.deleteField(payload.id);
                }
            ),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            }),
        );

    @Effect()
    deleteFields$ = this.actions$
        .pipe(
            ofType<ManyFieldsDeleted>(FieldActionTypes.ManyFieldsDeleted),
            mergeMap(( { payload } ) => {
                    this.store.dispatch(this.showActionLoadingDistpatcher);
                    return this.fieldsService.deleteFields(payload.ids);
                }
            ),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            }),
        );

    @Effect()
    updateField$ = this.actions$
        .pipe(
            ofType<FieldUpdated>(FieldActionTypes.FieldUpdated),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showActionLoadingDistpatcher);
                return this.fieldsService.updateField(payload.field);
            }),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            })
        );

    @Effect()
    updateFieldsStatus$ = this.actions$
        .pipe(
            ofType<FieldsStatusUpdated>(FieldActionTypes.FieldsStatusUpdated),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showActionLoadingDistpatcher);
                return this.fieldsService.updateStatusForField(payload.fields, payload.status);
            }),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            })
        );

    @Effect()
    createField$ = this.actions$
        .pipe(
            ofType<FieldOnServerCreated>(FieldActionTypes.FieldOnServerCreated),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showActionLoadingDistpatcher);
                return this.fieldsService.createField(payload.field).pipe(
                    tap(res => {
                        this.store.dispatch(new FieldCreated({ field: res }));
                    })
                );
            }),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            }),
        );

    constructor(private actions$: Actions, private fieldsService: FieldsService, private store: Store<AppState>) { }
}
