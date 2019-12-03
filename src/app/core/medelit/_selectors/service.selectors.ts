// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// Lodash
import { each } from 'lodash';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
// State
import { ServicesState } from '../_reducers/service.reducers';
import { ServiceModel } from '../_models/service.model';

export const selectServicesState = createFeatureSelector<ServicesState>('services');

export const selectServiceById = (serviceId: number) => createSelector(
    selectServicesState,
    servicesState => servicesState.entities[serviceId]
);

export const selectServicesPageLoading = createSelector(
    selectServicesState,
	servicesState => servicesState.listLoading
);

export const selectServicesActionLoading = createSelector(
    selectServicesState,
    servicesState => servicesState.actionsloading
);

export const selectServicesPageLastQuery = createSelector(
	selectServicesState,
	servicesState => servicesState.lastQuery
);

export const selectLastCreatedServiceId = createSelector(
    selectServicesState,
	servicesState => servicesState.lastCreatedServiceId
);

export const selectServicesShowInitWaitingMessage = createSelector(
    selectServicesState,
    servicesState => servicesState.showInitWaitingMessage
);

export const selectServicesInStore = createSelector(
    selectServicesState,
    servicesState => {
		const items: ServiceModel[] = [];
        each(servicesState.entities, element => {
            items.push(element);
        });
        const httpExtension = new HttpExtenstionsModel();
		const result: ServiceModel[] = httpExtension.sortArray(items, servicesState.lastQuery.sortField, servicesState.lastQuery.sortOrder);
		return new QueryResultsModel(result, servicesState.totalCount, '');
    }
);
