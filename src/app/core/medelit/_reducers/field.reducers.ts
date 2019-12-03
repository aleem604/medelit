// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter, Update } from '@ngrx/entity';
// Actions
import { FieldActions, FieldActionTypes } from '../_actions/field.actions';
// Models
import { FieldModel } from '../_models/field.model';
import { QueryParamsModel } from '../../_base/crud';

export interface FieldsState extends EntityState<FieldModel> {
    listLoading: boolean;
    actionsloading: boolean;
    totalCount: number;
    lastCreatedFieldId: number;
    lastQuery: QueryParamsModel;
    showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<FieldModel> = createEntityAdapter<FieldModel>();

export const initialFieldsState: FieldsState = adapter.getInitialState({
    fieldForEdit: null,
    listLoading: false,
    actionsloading: false,
    totalCount: 0,
    lastCreatedFieldId: undefined,
    lastQuery: new QueryParamsModel({}),
    showInitWaitingMessage: true
});

export function fieldsReducer(state = initialFieldsState, action: FieldActions): FieldsState {
    switch  (action.type) {
        case FieldActionTypes.FieldsPageToggleLoading: {
            return {
                ...state, listLoading: action.payload.isLoading, lastCreatedFieldId: undefined
            };
        }
        case FieldActionTypes.FieldActionToggleLoading: {
            return {
                ...state, actionsloading: action.payload.isLoading
            };
        }
        case FieldActionTypes.FieldOnServerCreated: return {
            ...state
        };
		case FieldActionTypes.FieldCreated: return adapter.addOne(action.payload.field, {
			...state, lastCreatedFieldId: action.payload.field.id
        });
        case FieldActionTypes.FieldUpdated: return adapter.updateOne(action.payload.partialField, state);
        case FieldActionTypes.FieldsStatusUpdated: {
            const _partialFields: Update<FieldModel>[] = [];
            // tslint:disable-next-line:prefer-const
            for (let i = 0; i < action.payload.fields.length; i++) {
                _partialFields.push({
				    id: action.payload.fields[i].id,
				    changes: {
                        status: action.payload.status
                    }
			    });
            }
            return adapter.updateMany(_partialFields, state);
        }
        case FieldActionTypes.OneFieldDeleted: return adapter.removeOne(action.payload.id, state);
        case FieldActionTypes.ManyFieldsDeleted: return adapter.removeMany(action.payload.ids, state);
        case FieldActionTypes.FieldsPageCancelled: {
            return {
                ...state, listLoading: false, lastQuery: new QueryParamsModel({})
            };
        }
        case FieldActionTypes.FieldsPageLoaded: {
            return adapter.addMany(action.payload.fields, {
                ...initialFieldsState,
                totalCount: action.payload.totalCount,
                listLoading: false,
                lastQuery: action.payload.page,
                showInitWaitingMessage: false
            });
        }
        default: return state;
    }
}

export const getFieldState = createFeatureSelector<FieldModel>('fields');

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal
} = adapter.getSelectors();
