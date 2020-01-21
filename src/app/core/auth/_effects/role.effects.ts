// Angular
import { Injectable } from '@angular/core';
// RxJS
import { of, Observable, defer, forkJoin } from 'rxjs';
import { mergeMap, map, withLatestFrom, filter, tap } from 'rxjs/operators';
// NGRX
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store, select, Action } from '@ngrx/store';
import { QueryResultsModel, QueryParamsModel } from '../../_base/crud';
import { AuthService } from '../_services';
import { AppState } from '../../../core/reducers';

import { allRolesLoaded } from '../_selectors/role.selectors';

import {
    AllRolesLoaded,
    AllRolesRequested,
    RoleActionTypes,
    RolesPageRequested,
    RolesPageLoaded,
    RoleUpdated,
    RolesPageToggleLoading,
    RoleDeleted,
    RoleOnServerCreated,
    RoleCreated,
    RolesActionToggleLoading
} from '../_actions/role.actions';
import { ApiResponse } from '../../medelit';
import { Role } from '..';

@Injectable()
export class RoleEffects {
    showPageLoadingDistpatcher = new RolesPageToggleLoading({ isLoading: true });
    hidePageLoadingDistpatcher = new RolesPageToggleLoading({ isLoading: false });

    showActionLoadingDistpatcher = new RolesActionToggleLoading({ isLoading: true });
    hideActionLoadingDistpatcher = new RolesActionToggleLoading({ isLoading: false });

    @Effect()
    loadAllRoles$ = this.actions$
        .pipe(
            ofType<AllRolesRequested>(RoleActionTypes.AllRolesRequested),
            withLatestFrom(this.store.pipe(select(allRolesLoaded))),
            filter(([action, isAllRolesLoaded]) => !isAllRolesLoaded),
            mergeMap(() => this.auth.getAllRoles()),
			map(roles => {
				let r = (roles as unknown as ApiResponse).data as unknown as Role[];
                return new AllRolesLoaded({roles: r});
            })
          );

    @Effect()
    loadRolesPage$ = this.actions$
        .pipe(
            ofType<RolesPageRequested>(RoleActionTypes.RolesPageRequested),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showPageLoadingDistpatcher);
                const requestToServer = this.auth.findRoles(payload.page);
                const lastQuery = of(payload.page);
                return forkJoin(requestToServer, lastQuery);
            }),
            map(response => {
                const result: QueryResultsModel = response[0].data;
                const lastQuery: QueryParamsModel = response[1];
                this.store.dispatch(this.hidePageLoadingDistpatcher);

                return new RolesPageLoaded({
                    roles: result.items,
                    totalCount: result.totalCount,
                    page: lastQuery
                });
            }),
        );

    @Effect()
    deleteRole$ = this.actions$
        .pipe(
            ofType<RoleDeleted>(RoleActionTypes.RoleDeleted),
            mergeMap(( { payload } ) => {
                    this.store.dispatch(this.showActionLoadingDistpatcher);
                    return this.auth.deleteRole(payload.id);
                }
            ),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            }),
        );

    @Effect()
    updateRole$ = this.actions$
        .pipe(
            ofType<RoleUpdated>(RoleActionTypes.RoleUpdated),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showActionLoadingDistpatcher);
                return this.auth.updateRole(payload.role);
            }),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            }),
        );


    @Effect()
    createRole$ = this.actions$
        .pipe(
            ofType<RoleOnServerCreated>(RoleActionTypes.RoleOnServerCreated),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showActionLoadingDistpatcher);
                return this.auth.createRole(payload.role).pipe(
                    tap(res => {
                        this.store.dispatch(new RoleCreated({ role: res }));
                    })
                );
            }),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            }),
        );

    @Effect()
    init$: Observable<Action> = defer(() => {
        return of(new AllRolesRequested());
    });

    constructor(private actions$: Actions, private auth: AuthService, private store: Store<AppState>) { }
}
