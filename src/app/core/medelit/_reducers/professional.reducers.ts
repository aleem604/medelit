// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter, Update } from '@ngrx/entity';
// Actions
import { ProfessionalActions, ProfessionalActionTypes } from '../_actions/professional.actions';
// Models
import { ProfessionalModel } from '../_models/professional.model';
import { QueryParamsModel } from '../../_base/crud';

export interface ProfessionalsState extends EntityState<ProfessionalModel> {
    listLoading: boolean;
    actionsloading: boolean;
    totalCount: number;
    lastCreatedProfessionalId: number;
    lastQuery: QueryParamsModel;
    showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<ProfessionalModel> = createEntityAdapter<ProfessionalModel>();

export const initialProfessionalsState: ProfessionalsState = adapter.getInitialState({
    professionalForEdit: null,
    listLoading: false,
    actionsloading: false,
    totalCount: 0,
    lastCreatedProfessionalId: undefined,
    lastQuery: new QueryParamsModel({}),
    showInitWaitingMessage: true
});

export function professionalsReducer(state = initialProfessionalsState, action: ProfessionalActions): ProfessionalsState {
    switch  (action.type) {
        case ProfessionalActionTypes.ProfessionalsPageToggleLoading: {
            return {
                ...state, listLoading: action.payload.isLoading, lastCreatedProfessionalId: undefined
            };
        }
        case ProfessionalActionTypes.ProfessionalActionToggleLoading: {
            return {
                ...state, actionsloading: action.payload.isLoading
            };
        }
        case ProfessionalActionTypes.ProfessionalOnServerCreated: return {
            ...state
        };
		case ProfessionalActionTypes.ProfessionalCreated: return adapter.addOne(action.payload.professional, {
			...state, lastCreatedProfessionalId: action.payload.professional.id
        });
        case ProfessionalActionTypes.ProfessionalUpdated: return adapter.updateOne(action.payload.partialProfessional, state);
        case ProfessionalActionTypes.ProfessionalsStatusUpdated: {
            const _partialProfessionals: Update<ProfessionalModel>[] = [];
            // tslint:disable-next-line:prefer-const
            for (let i = 0; i < action.payload.professionals.length; i++) {
                _partialProfessionals.push({
				    id: action.payload.professionals[i].id,
				    changes: {
                        status: action.payload.status
                    }
			    });
            }
            return adapter.updateMany(_partialProfessionals, state);
        }
        case ProfessionalActionTypes.OneProfessionalDeleted: return adapter.removeOne(action.payload.id, state);
        case ProfessionalActionTypes.ManyProfessionalsDeleted: return adapter.removeMany(action.payload.ids, state);
        case ProfessionalActionTypes.ProfessionalsPageCancelled: {
            return {
                ...state, listLoading: false, lastQuery: new QueryParamsModel({})
            };
        }
        case ProfessionalActionTypes.ProfessionalsPageLoaded: {
            return adapter.addMany(action.payload.professionals, {
                ...initialProfessionalsState,
                totalCount: action.payload.totalCount,
                listLoading: false,
                lastQuery: action.payload.page,
                showInitWaitingMessage: false
            });
        }
        default: return state;
    }
}

export const getProfessionalState = createFeatureSelector<ProfessionalModel>('professionals');

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal
} = adapter.getSelectors();
