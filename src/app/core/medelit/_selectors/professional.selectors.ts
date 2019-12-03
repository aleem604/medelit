// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// Lodash
import { each } from 'lodash';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
// State
import { ProfessionalsState } from '../_reducers/professional.reducers';
import { ProfessionalModel } from '../_models/professional.model';

export const selectProfessionalsState = createFeatureSelector<ProfessionalsState>('professionals');

export const selectProfessionalById = (professionalId: number) => createSelector(
    selectProfessionalsState,
    professionalsState => professionalsState.entities[professionalId]
);

export const selectProfessionalsPageLoading = createSelector(
    selectProfessionalsState,
    professionalsState => professionalsState.listLoading
);

export const selectProfessionalsActionLoading = createSelector(
    selectProfessionalsState,
    customersState => customersState.actionsloading
);

export const selectProfessionalsPageLastQuery = createSelector(
    selectProfessionalsState,
    professionalsState => professionalsState.lastQuery
);

export const selectLastCreatedProfessionalId = createSelector(
    selectProfessionalsState,
    professionalsState => professionalsState.lastCreatedProfessionalId
);

export const selectProfessionalsInitWaitingMessage = createSelector(
    selectProfessionalsState,
    professionalsState => professionalsState.showInitWaitingMessage
);

export const selectProfessionalsInStore = createSelector(
    selectProfessionalsState,
    professionalsState => {
        const items: ProfessionalModel[] = [];
        each(professionalsState.entities, element => {
            items.push(element);
        });
        const httpExtension = new HttpExtenstionsModel();
        const result: ProfessionalModel[] = httpExtension.sortArray(items, professionalsState.lastQuery.sortField, professionalsState.lastQuery.sortOrder);
        return new QueryResultsModel(result, professionalsState.totalCount, '');
    }
);

export const selectHasProfessionalsInStore = createSelector(
    selectProfessionalsInStore,
    queryResult => {
        if (!queryResult.totalCount) {
            return false;
        }

        return true;
    }
);
