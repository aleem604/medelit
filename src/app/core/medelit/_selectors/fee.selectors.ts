// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// Lodash
import { each } from 'lodash';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
// State
import { FeesState } from '../_reducers/fee.reducers';
import { FeeModel } from '../_models/fee.model';

export const selectFeesState = createFeatureSelector<FeesState>('fees');

export const selectFeeById = (feeId: number) => createSelector(
    selectFeesState,
    feesState => feesState.entities[feeId]
);

export const selectFeesPageLoading = createSelector(
    selectFeesState,
    feesState => feesState.listLoading
);

export const selectFeesActionLoading = createSelector(
    selectFeesState,
    customersState => customersState.actionsloading
);

export const selectFeesPageLastQuery = createSelector(
    selectFeesState,
    feesState => feesState.lastQuery
);

export const selectLastCreatedFeeId = createSelector(
    selectFeesState,
    feesState => feesState.lastCreatedFeeId
);

export const selectFeesInitWaitingMessage = createSelector(
    selectFeesState,
    feesState => feesState.showInitWaitingMessage
);

export const selectFeesInStore = createSelector(
    selectFeesState,
    feesState => {
        const items: FeeModel[] = [];
        each(feesState.entities, element => {
            items.push(element);
        });
        const httpExtension = new HttpExtenstionsModel();
        const result: FeeModel[] = httpExtension.sortArray(items, feesState.lastQuery.sortField, feesState.lastQuery.sortOrder);
        return new QueryResultsModel(result, feesState.totalCount, '');
    }
);

export const selectHasFeesInStore = createSelector(
    selectFeesInStore,
    queryResult => {
        if (!queryResult.totalCount) {
            return false;
        }

        return true;
    }
);
