
// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter, Update } from '@ngrx/entity';
// Actions
import { FeeActions, FeeActionTypes } from '../_actions/fee.actions';
// CRUD
import { QueryParamsModel } from '../../_base/crud';
// Models
import { FeeModel } from '../_models/fee.model';

export interface FeesState extends EntityState<FeeModel> {
    listLoading: boolean;
    actionsloading: boolean;
    totalCount: number;
    lastQuery: QueryParamsModel;
    lastCreatedFeeId: number;
    showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<FeeModel> = createEntityAdapter<FeeModel>();

export const initialFeesState: FeesState = adapter.getInitialState({
    listLoading: false,
    actionsloading: false,
    totalCount: 0,
    lastQuery:  new QueryParamsModel({}),
    lastCreatedFeeId: undefined,
    showInitWaitingMessage: true
});

export function feesReducer(state = initialFeesState, action: FeeActions): FeesState {
    switch  (action.type) {
        case FeeActionTypes.FeesPageToggleLoading: return {
            ...state, listLoading: action.payload.isLoading, lastCreatedFeeId: undefined
        };
        case FeeActionTypes.FeeActionToggleLoading: return {
            ...state, actionsloading: action.payload.isLoading
        };
        case FeeActionTypes.FeeOnServerCreated: return {
            ...state
        };
        case FeeActionTypes.FeeCreated: return adapter.addOne(action.payload.fee, {
             ...state, lastCreatedFeeId: action.payload.fee.id
        });
        case FeeActionTypes.FeeUpdated: return adapter.updateOne(action.payload.partialFee, state);
        case FeeActionTypes.FeesStatusUpdated: {
            const _partialFees: Update<FeeModel>[] = [];
            for (let i = 0; i < action.payload.fees.length; i++) {
                _partialFees.push({
				    id: action.payload.fees[i].id,
				    changes: {
                        status: action.payload.status
                    }
			    });
            }
            return adapter.updateMany(_partialFees, state);
        }
        case FeeActionTypes.OneFeeDeleted: return adapter.removeOne(action.payload.id, state);
        case FeeActionTypes.ManyFeesDeleted: return adapter.removeMany(action.payload.ids, state);
        case FeeActionTypes.FeesPageCancelled: return {
            ...state, listLoading: false, lastQuery: new QueryParamsModel({})
        };
        case FeeActionTypes.FeesPageLoaded:
            return adapter.addMany(action.payload.fees, {
                ...initialFeesState,
                totalCount: action.payload.totalCount,
                listLoading: false,
                lastQuery: action.payload.page,
                showInitWaitingMessage: false
            });
        default: return state;
    }
}

export const getFeeState = createFeatureSelector<FeeModel>('fees');

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal
} = adapter.getSelectors();
