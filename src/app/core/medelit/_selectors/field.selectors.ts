// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// Lodash
import { each } from 'lodash';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
// State
import { FieldsState } from '../_reducers/field.reducers';
import { FieldModel } from '../_models/field.model';

export const selectFieldsState = createFeatureSelector<FieldsState>('fields');

export const selectFieldById = (fieldId: number) => createSelector(
    selectFieldsState,
    fieldsState => fieldsState.entities[fieldId]
);

export const selectFieldsPageLoading = createSelector(
    selectFieldsState,
	fieldsState => fieldsState.listLoading
);

export const selectFieldsActionLoading = createSelector(
    selectFieldsState,
    fieldsState => fieldsState.actionsloading
);

export const selectFieldsPageLastQuery = createSelector(
	selectFieldsState,
	fieldsState => fieldsState.lastQuery
);

export const selectLastCreatedFieldId = createSelector(
    selectFieldsState,
	fieldsState => fieldsState.lastCreatedFieldId
);

export const selectFieldsShowInitWaitingMessage = createSelector(
    selectFieldsState,
    fieldsState => fieldsState.showInitWaitingMessage
);

export const selectFieldsInStore = createSelector(
    selectFieldsState,
    fieldsState => {
		const items: FieldModel[] = [];
        each(fieldsState.entities, element => {
            items.push(element);
        });
        const httpExtension = new HttpExtenstionsModel();
		const result: FieldModel[] = httpExtension.sortArray(items, fieldsState.lastQuery.sortField, fieldsState.lastQuery.sortOrder);
		return new QueryResultsModel(result, fieldsState.totalCount, '');
    }
);
