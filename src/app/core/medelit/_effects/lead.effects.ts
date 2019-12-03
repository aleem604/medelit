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
import { LeadsService } from '../_services/';
// State
import { AppState } from '../../../core/reducers';
// Actions
import {
    LeadActionTypes,
    LeadsPageRequested,
    LeadsPageLoaded,
    ManyLeadsDeleted,
    OneLeadDeleted,
    LeadActionToggleLoading,
    LeadsPageToggleLoading,
    LeadUpdated,
    LeadsStatusUpdated,
    LeadCreated,
    LeadOnServerCreated
} from '../_actions/lead.actions';
import { of } from 'rxjs';

@Injectable()
export class LeadEffects {
    showPageLoadingDistpatcher = new LeadsPageToggleLoading({ isLoading: true });
    showActionLoadingDistpatcher = new LeadActionToggleLoading({ isLoading: true });
    hideActionLoadingDistpatcher = new LeadActionToggleLoading({ isLoading: false });

    @Effect()
    loadLeadsPage$ = this.actions$.pipe(
        ofType<LeadsPageRequested>(LeadActionTypes.LeadsPageRequested),
        mergeMap(( { payload } ) => {
            this.store.dispatch(this.showPageLoadingDistpatcher);
            const requestToServer = this.leadsService.findLeads(payload.page);
            const lastQuery = of(payload.page);
            return forkJoin(requestToServer, lastQuery);
        }),
        map(response => {
            const result: QueryResultsModel = response[0].data;
            const lastQuery: QueryParamsModel = response[1];
            const pageLoadedDispatch = new LeadsPageLoaded({
                leads: result.items,
                totalCount: result.totalCount,
                page: lastQuery
            });
            return pageLoadedDispatch;
        })
    );

    @Effect()
    deleteLead$ = this.actions$
        .pipe(
            ofType<OneLeadDeleted>(LeadActionTypes.OneLeadDeleted),
            mergeMap(( { payload } ) => {
                    this.store.dispatch(this.showActionLoadingDistpatcher);
                    return this.leadsService.deleteLead(payload.id);
                }
            ),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            }),
        );

    @Effect()
    deleteLeads$ = this.actions$
        .pipe(
            ofType<ManyLeadsDeleted>(LeadActionTypes.ManyLeadsDeleted),
            mergeMap(( { payload } ) => {
                    this.store.dispatch(this.showActionLoadingDistpatcher);
                    return this.leadsService.deleteLeads(payload.ids);
                }
            ),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            }),
        );

    @Effect()
    updateLead$ = this.actions$
        .pipe(
            ofType<LeadUpdated>(LeadActionTypes.LeadUpdated),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showActionLoadingDistpatcher);
                return this.leadsService.updateLead(payload.lead);
            }),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            })
        );

    @Effect()
    updateLeadsStatus$ = this.actions$
        .pipe(
            ofType<LeadsStatusUpdated>(LeadActionTypes.LeadsStatusUpdated),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showActionLoadingDistpatcher);
                return this.leadsService.updateStatusForLead(payload.leads, payload.status);
            }),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            })
        );

    @Effect()
    createLead$ = this.actions$
        .pipe(
            ofType<LeadOnServerCreated>(LeadActionTypes.LeadOnServerCreated),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showActionLoadingDistpatcher);
                return this.leadsService.createLead(payload.lead).pipe(
                    tap(res => {
                        this.store.dispatch(new LeadCreated({ lead: res }));
                    })
                );
            }),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            }),
        );

    constructor(private actions$: Actions, private leadsService: LeadsService, private store: Store<AppState>) { }
}
