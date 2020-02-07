// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter, Update } from '@ngrx/entity';
// Actions
import { LeadActions, LeadActionTypes } from '../_actions/lead.actions';
// Models
import { LeadModel } from '../_models/lead/lead.model';
import { QueryParamsModel } from '../../_base/crud';

export interface LeadsState extends EntityState<LeadModel> {
    listLoading: boolean;
    actionsloading: boolean;
    totalCount: number;
    lastCreatedLeadId: number;
    lastQuery: QueryParamsModel;
    showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<LeadModel> = createEntityAdapter<LeadModel>();

export const initialLeadsState: LeadsState = adapter.getInitialState({
    leadForEdit: null,
    listLoading: false,
    actionsloading: false,
    totalCount: 0,
    lastCreatedLeadId: undefined,
    lastQuery: new QueryParamsModel({}),
    showInitWaitingMessage: true
});

export function leadsReducer(state = initialLeadsState, action: LeadActions): LeadsState {
    switch  (action.type) {
        case LeadActionTypes.LeadsPageToggleLoading: {
            return {
                ...state, listLoading: action.payload.isLoading, lastCreatedLeadId: undefined
            };
        }
        case LeadActionTypes.LeadActionToggleLoading: {
            return {
                ...state, actionsloading: action.payload.isLoading
            };
        }
        case LeadActionTypes.LeadOnServerCreated: return {
            ...state
        };
		case LeadActionTypes.LeadCreated: return adapter.addOne(action.payload.lead, {
			...state, lastCreatedLeadId: action.payload.lead.id
        });
        case LeadActionTypes.LeadUpdated: return adapter.updateOne(action.payload.partialLead, state);
        case LeadActionTypes.LeadsStatusUpdated: {
            const _partialLeads: Update<LeadModel>[] = [];
            // tslint:disable-next-line:prefer-const
            for (let i = 0; i < action.payload.leads.length; i++) {
                _partialLeads.push({
				    id: action.payload.leads[i].id,
				    changes: {
                        status: action.payload.status
                    }
			    });
            }
            return adapter.updateMany(_partialLeads, state);
        }
        case LeadActionTypes.OneLeadDeleted: return adapter.removeOne(action.payload.id, state);
        case LeadActionTypes.ManyLeadsDeleted: return adapter.removeMany(action.payload.ids, state);
        case LeadActionTypes.LeadsPageCancelled: {
            return {
                ...state, listLoading: false, lastQuery: new QueryParamsModel({})
            };
        }
        case LeadActionTypes.LeadsPageLoaded: {
            return adapter.addMany(action.payload.leads, {
                ...initialLeadsState,
                totalCount: action.payload.totalCount,
                listLoading: false,
                lastQuery: action.payload.page,
                showInitWaitingMessage: false
            });
        }
        default: return state;
    }
}

export const getLeadState = createFeatureSelector<LeadModel>('leads');

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal
} = adapter.getSelectors();
