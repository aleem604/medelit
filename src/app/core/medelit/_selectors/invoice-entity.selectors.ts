// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// Lodash
import { each } from 'lodash';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
// State
import { InvoiceEntitiesState } from '../_reducers/invoice-entity.reducers';
import { InvoiceEntityModel } from '../_models/invoice-entity.model';

export const selectInvoiceEntitiesState = createFeatureSelector<InvoiceEntitiesState>('invoiceEntities');

export const selectInvoiceEntityById = (leadId: number) => createSelector(
    selectInvoiceEntitiesState,
    leadsState => leadsState.entities[leadId]
);

export const selectInvoiceEntitiesPageLoading = createSelector(
    selectInvoiceEntitiesState,
	leadsState => leadsState.listLoading
);

export const selectInvoiceEntitiesActionLoading = createSelector(
    selectInvoiceEntitiesState,
    leadsState => leadsState.actionsloading
);

export const selectInvoiceEntitiesPageLastQuery = createSelector(
	selectInvoiceEntitiesState,
	leadsState => leadsState.lastQuery
);

export const selectLastCreatedInvoiceEntityId = createSelector(
    selectInvoiceEntitiesState,
	leadsState => leadsState.lastCreatedInvoiceEntityId
);

export const selectInvoiceEntitiesShowInitWaitingMessage = createSelector(
    selectInvoiceEntitiesState,
    leadsState => leadsState.showInitWaitingMessage
);

export const selectInvoiceEntitiesInStore = createSelector(
    selectInvoiceEntitiesState,
    leadsState => {
		const items: InvoiceEntityModel[] = [];
        each(leadsState.entities, element => {
            items.push(element);
        });
        const httpExtension = new HttpExtenstionsModel();
		const result: InvoiceEntityModel[] = httpExtension.sortArray(items, leadsState.lastQuery.sortField, leadsState.lastQuery.sortOrder);
		return new QueryResultsModel(result, leadsState.totalCount, '');
    }
);
