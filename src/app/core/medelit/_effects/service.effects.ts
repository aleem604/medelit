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
import { ServicesService } from '../_services/';
// State
import { AppState } from '../../../core/reducers';
// Actions
import {
    ServiceActionTypes,
    ServicesPageRequested,
    ServicesPageLoaded,
    ManyServicesDeleted,
    OneServiceDeleted,
    ServiceActionToggleLoading,
    ServicesPageToggleLoading,
    ServiceUpdated,
    ServicesStatusUpdated,
    ServiceCreated,
    ServiceOnServerCreated
} from '../_actions/service.actions';
import { of } from 'rxjs';

@Injectable()
export class ServiceEffects {
    showPageLoadingDistpatcher = new ServicesPageToggleLoading({ isLoading: true });
    showActionLoadingDistpatcher = new ServiceActionToggleLoading({ isLoading: true });
    hideActionLoadingDistpatcher = new ServiceActionToggleLoading({ isLoading: false });

    @Effect()
    loadServicesPage$ = this.actions$.pipe(
        ofType<ServicesPageRequested>(ServiceActionTypes.ServicesPageRequested),
        mergeMap(( { payload } ) => {
            this.store.dispatch(this.showPageLoadingDistpatcher);
            const requestToServer = this.servicesService.findServices(payload.page);
            const lastQuery = of(payload.page);
            return forkJoin(requestToServer, lastQuery);
        }),
        map(response => {
            const result: QueryResultsModel = response[0].data;
            const lastQuery: QueryParamsModel = response[1];
            const pageLoadedDispatch = new ServicesPageLoaded({
                services: result.items,
                totalCount: result.totalCount,
                page: lastQuery
            });
            return pageLoadedDispatch;
        })
    );

    @Effect()
    deleteService$ = this.actions$
        .pipe(
            ofType<OneServiceDeleted>(ServiceActionTypes.OneServiceDeleted),
            mergeMap(( { payload } ) => {
                    this.store.dispatch(this.showActionLoadingDistpatcher);
                    return this.servicesService.deleteService(payload.id);
                }
            ),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            }),
        );

    @Effect()
    deleteServices$ = this.actions$
        .pipe(
            ofType<ManyServicesDeleted>(ServiceActionTypes.ManyServicesDeleted),
            mergeMap(( { payload } ) => {
                    this.store.dispatch(this.showActionLoadingDistpatcher);
                    return this.servicesService.deleteServices(payload.ids);
                }
            ),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            }),
        );

    @Effect()
    updateService$ = this.actions$
        .pipe(
            ofType<ServiceUpdated>(ServiceActionTypes.ServiceUpdated),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showActionLoadingDistpatcher);
                return this.servicesService.updateService(payload.service);
            }),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            })
        );

    @Effect()
    updateServicesStatus$ = this.actions$
        .pipe(
            ofType<ServicesStatusUpdated>(ServiceActionTypes.ServicesStatusUpdated),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showActionLoadingDistpatcher);
                return this.servicesService.updateStatusForService(payload.services, payload.status);
            }),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            })
        );

    @Effect()
    createService$ = this.actions$
        .pipe(
            ofType<ServiceOnServerCreated>(ServiceActionTypes.ServiceOnServerCreated),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showActionLoadingDistpatcher);
                return this.servicesService.createService(payload.service).pipe(
                    tap(res => {
                        this.store.dispatch(new ServiceCreated({ service: res }));
                    })
                );
            }),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            }),
        );

    constructor(private actions$: Actions, private servicesService: ServicesService, private store: Store<AppState>) { }
}
