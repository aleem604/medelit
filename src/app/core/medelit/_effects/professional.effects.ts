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
import { ProfessionalsService } from '../_services/';
// State
import { AppState } from '../../../core/reducers';
// Actions
import {
    ProfessionalActionTypes,
    ProfessionalsPageRequested,
    ProfessionalsPageLoaded,
    ManyProfessionalsDeleted,
    OneProfessionalDeleted,
    ProfessionalActionToggleLoading,
    ProfessionalsPageToggleLoading,
    ProfessionalUpdated,
    ProfessionalsStatusUpdated,
    ProfessionalCreated,
    ProfessionalOnServerCreated
} from '../_actions/professional.actions';
import { of } from 'rxjs';

@Injectable()
export class ProfessionalEffects {
    showPageLoadingDistpatcher = new ProfessionalsPageToggleLoading({ isLoading: true });
    showActionLoadingDistpatcher = new ProfessionalActionToggleLoading({ isLoading: true });
    hideActionLoadingDistpatcher = new ProfessionalActionToggleLoading({ isLoading: false });

    @Effect()
    loadProfessionalsPage$ = this.actions$.pipe(
        ofType<ProfessionalsPageRequested>(ProfessionalActionTypes.ProfessionalsPageRequested),
        mergeMap(( { payload } ) => {
            this.store.dispatch(this.showPageLoadingDistpatcher);
            const requestToServer = this.professionalsService.findProfessionals(payload.page);
            const lastQuery = of(payload.page);
            return forkJoin(requestToServer, lastQuery);
        }),
        map(response => {
            const result: QueryResultsModel = response[0].data;
            const lastQuery: QueryParamsModel = response[1];
            const pageLoadedDispatch = new ProfessionalsPageLoaded({
                professionals: result.items,
                totalCount: result.totalCount,
                page: lastQuery
            });
            return pageLoadedDispatch;
        })
    );

    @Effect()
    deleteProfessional$ = this.actions$
        .pipe(
            ofType<OneProfessionalDeleted>(ProfessionalActionTypes.OneProfessionalDeleted),
            mergeMap(( { payload } ) => {
                    this.store.dispatch(this.showActionLoadingDistpatcher);
                    return this.professionalsService.deleteProfessional(payload.id);
                }
            ),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            }),
        );

    @Effect()
    deleteProfessionals$ = this.actions$
        .pipe(
            ofType<ManyProfessionalsDeleted>(ProfessionalActionTypes.ManyProfessionalsDeleted),
            mergeMap(( { payload } ) => {
                    this.store.dispatch(this.showActionLoadingDistpatcher);
                    return this.professionalsService.deleteProfessionals(payload.ids);
                }
            ),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            }),
        );

    @Effect()
    updateProfessional$ = this.actions$
        .pipe(
            ofType<ProfessionalUpdated>(ProfessionalActionTypes.ProfessionalUpdated),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showActionLoadingDistpatcher);
                return this.professionalsService.updateProfessional(payload.professional);
            }),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            })
        );

    @Effect()
    updateProfessionalsStatus$ = this.actions$
        .pipe(
            ofType<ProfessionalsStatusUpdated>(ProfessionalActionTypes.ProfessionalsStatusUpdated),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showActionLoadingDistpatcher);
                return this.professionalsService.updateStatusForProfessional(payload.professionals, payload.status);
            }),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            })
        );

    @Effect()
    createProfessional$ = this.actions$
        .pipe(
            ofType<ProfessionalOnServerCreated>(ProfessionalActionTypes.ProfessionalOnServerCreated),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showActionLoadingDistpatcher);
                return this.professionalsService.createProfessional(payload.professional).pipe(
                    tap(res => {
                        this.store.dispatch(new ProfessionalCreated({ professional: res }));
                    })
                );
            }),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            }),
        );

    constructor(private actions$: Actions, private professionalsService: ProfessionalsService, private store: Store<AppState>) { }
}
