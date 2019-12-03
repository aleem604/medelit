// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter, Update } from '@ngrx/entity';
// Actions
import { ServiceActions, ServiceActionTypes } from '../_actions/service.actions';
// Models
import { ServiceModel } from '../_models/service.model';
import { QueryParamsModel } from '../../_base/crud';

export interface ServicesState extends EntityState<ServiceModel> {
    listLoading: boolean;
    actionsloading: boolean;
    totalCount: number;
    lastCreatedServiceId: number;
    lastQuery: QueryParamsModel;
    showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<ServiceModel> = createEntityAdapter<ServiceModel>();

export const initialServicesState: ServicesState = adapter.getInitialState({
    serviceForEdit: null,
    listLoading: false,
    actionsloading: false,
    totalCount: 0,
    lastCreatedServiceId: undefined,
    lastQuery: new QueryParamsModel({}),
    showInitWaitingMessage: true
});

export function servicesReducer(state = initialServicesState, action: ServiceActions): ServicesState {
    switch  (action.type) {
        case ServiceActionTypes.ServicesPageToggleLoading: {
            return {
                ...state, listLoading: action.payload.isLoading, lastCreatedServiceId: undefined
            };
        }
        case ServiceActionTypes.ServiceActionToggleLoading: {
            return {
                ...state, actionsloading: action.payload.isLoading
            };
        }
        case ServiceActionTypes.ServiceOnServerCreated: return {
            ...state
        };
		case ServiceActionTypes.ServiceCreated: return adapter.addOne(action.payload.service, {
			...state, lastCreatedServiceId: action.payload.service.id
        });
        case ServiceActionTypes.ServiceUpdated: return adapter.updateOne(action.payload.partialService, state);
        case ServiceActionTypes.ServicesStatusUpdated: {
            const _partialServices: Update<ServiceModel>[] = [];
            // tslint:disable-next-line:prefer-const
            for (let i = 0; i < action.payload.services.length; i++) {
                _partialServices.push({
				    id: action.payload.services[i].id,
				    changes: {
                        status: action.payload.status
                    }
			    });
            }
            return adapter.updateMany(_partialServices, state);
        }
        case ServiceActionTypes.OneServiceDeleted: return adapter.removeOne(action.payload.id, state);
        case ServiceActionTypes.ManyServicesDeleted: return adapter.removeMany(action.payload.ids, state);
        case ServiceActionTypes.ServicesPageCancelled: {
            return {
                ...state, listLoading: false, lastQuery: new QueryParamsModel({})
            };
        }
        case ServiceActionTypes.ServicesPageLoaded: {
            return adapter.addMany(action.payload.services, {
                ...initialServicesState,
                totalCount: action.payload.totalCount,
                listLoading: false,
                lastQuery: action.payload.page,
                showInitWaitingMessage: false
            });
        }
        default: return state;
    }
}

export const getServiceState = createFeatureSelector<ServiceModel>('services');

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal
} = adapter.getSelectors();
