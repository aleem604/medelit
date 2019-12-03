// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter, Update } from '@ngrx/entity';
// Actions
import { InvoiceEntityActions, InvoiceEntityActionTypes } from '../_actions/invoice-entity.actions';
// Models
import {InvoiceEntityModel } from '../_models/invoice-entity.model';
import { QueryParamsModel } from '../../_base/crud';

export interface InvoiceEntitiesState extends EntityState<InvoiceEntityModel> {
    listLoading: boolean;
    actionsloading: boolean;
    totalCount: number;
	lastCreatedInvoiceEntityId: number;
    lastQuery: QueryParamsModel;
    showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<InvoiceEntityModel> = createEntityAdapter<InvoiceEntityModel>();

export const initialInvoiceEntitiesState: InvoiceEntitiesState = adapter.getInitialState({
    leadForEdit: null,
    listLoading: false,
    actionsloading: false,
	totalCount: 0,
    lastCreatedInvoiceEntityId: undefined,
    lastQuery: new QueryParamsModel({}),
    showInitWaitingMessage: true
});

export function invoiceEntitiesReducer(state = initialInvoiceEntitiesState, action: InvoiceEntityActions): InvoiceEntitiesState {
    switch  (action.type) {
		case InvoiceEntityActionTypes.InvoiceEntitiesPageToggleLoading: {
            return {
				...state, listLoading: action.payload.isLoading, lastCreatedInvoiceEntityId: undefined
            };
        }
		case InvoiceEntityActionTypes.InvoiceEntityActionToggleLoading: {
            return {
                ...state, actionsloading: action.payload.isLoading
            };
        }
		case InvoiceEntityActionTypes.InvoiceEntityOnServerCreated: return {
            ...state
        };
		case InvoiceEntityActionTypes.InvoiceEntityCreated: return adapter.addOne(action.payload.entity, {
			...state, lastCreatedLeadId: action.payload.entity.id
        });
		case InvoiceEntityActionTypes.InvoiceEntityUpdated: return adapter.updateOne(action.payload.partialEntity, state);
		case InvoiceEntityActionTypes.InvoiceEntitiesStatusUpdated: {
			const _partialLeads: Update<InvoiceEntityModel>[] = [];
            // tslint:disable-next-line:prefer-const
            for (let i = 0; i < action.payload.entities.length; i++) {
                _partialLeads.push({
				    id: action.payload.entities[i].id,
				    changes: {
                        status: action.payload.status
                    }
			    });
            }
            return adapter.updateMany(_partialLeads, state);
        }
		case InvoiceEntityActionTypes.OneInvoiceEntityDeleted: return adapter.removeOne(action.payload.id, state);
		case InvoiceEntityActionTypes.ManyInvoiceEntitiesDeleted: return adapter.removeMany(action.payload.ids, state);
		case InvoiceEntityActionTypes.InvoiceEntitiesPageCancelled: {
            return {
                ...state, listLoading: false, lastQuery: new QueryParamsModel({})
            };
        }
		case InvoiceEntityActionTypes.InvoiceEntitiesPageLoaded: {
            return adapter.addMany(action.payload.entities, {
                ...initialInvoiceEntitiesState,
                totalCount: action.payload.totalCount,
                listLoading: false,
                lastQuery: action.payload.page,
                showInitWaitingMessage: false
            });
        }
        default: return state;
    }
}

export const getLeadState = createFeatureSelector<InvoiceEntityModel>('invoiceEntities');

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal
} = adapter.getSelectors();
