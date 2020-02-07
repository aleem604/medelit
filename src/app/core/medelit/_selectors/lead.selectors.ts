// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// Lodash
import { each } from 'lodash';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
// State
import { LeadsState } from '../_reducers/lead.reducers';
import { LeadModel } from '../_models/lead/lead.model';

export const selectLeadsState = createFeatureSelector<LeadsState>('leads');

export const selectLeadById = (leadId: number) => createSelector(
    selectLeadsState,
    leadsState => leadsState.entities[leadId]
);

export const selectLeadsPageLoading = createSelector(
    selectLeadsState,
	leadsState => leadsState.listLoading
);

export const selectLeadsActionLoading = createSelector(
    selectLeadsState,
    leadsState => leadsState.actionsloading
);

export const selectLeadsPageLastQuery = createSelector(
	selectLeadsState,
	leadsState => leadsState.lastQuery
);

export const selectLastCreatedLeadId = createSelector(
    selectLeadsState,
	leadsState => leadsState.lastCreatedLeadId
);

export const selectLeadsShowInitWaitingMessage = createSelector(
    selectLeadsState,
    leadsState => leadsState.showInitWaitingMessage
);

export const selectLeadsInStore = createSelector(
    selectLeadsState,
    leadsState => {
		const items: LeadModel[] = [];
        each(leadsState.entities, element => {
            items.push(element);
        });
        const httpExtension = new HttpExtenstionsModel();
		const result: LeadModel[] = httpExtension.sortArray(items, leadsState.lastQuery.sortField, leadsState.lastQuery.sortOrder);
		return new QueryResultsModel(result, leadsState.totalCount, '');
    }
);
