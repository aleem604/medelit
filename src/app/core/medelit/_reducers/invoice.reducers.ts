// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter, Update } from '@ngrx/entity';
// Actions
import { InvoiceActions, InvoiceActionTypes } from '../_actions/invoice.actions';
// Models
import { InvoiceModel } from '../_models/invoice.model';
import { QueryParamsModel } from '../../_base/crud';

export interface InvoicesState extends EntityState<InvoiceModel> {
    listLoading: boolean;
    actionsloading: boolean;
    totalCount: number;
    lastCreatedInvoiceId: number;
    lastQuery: QueryParamsModel;
    showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<InvoiceModel> = createEntityAdapter<InvoiceModel>();

export const initialInvoicesState: InvoicesState = adapter.getInitialState({
    invoiceForEdit: null,
    listLoading: false,
    actionsloading: false,
    totalCount: 0,
    lastCreatedInvoiceId: undefined,
    lastQuery: new QueryParamsModel({}),
    showInitWaitingMessage: true
});

export function invoicesReducer(state = initialInvoicesState, action: InvoiceActions): InvoicesState {
    switch  (action.type) {
        case InvoiceActionTypes.InvoicesPageToggleLoading: {
            return {
                ...state, listLoading: action.payload.isLoading, lastCreatedInvoiceId: undefined
            };
        }
        case InvoiceActionTypes.InvoiceActionToggleLoading: {
            return {
                ...state, actionsloading: action.payload.isLoading
            };
        }
        case InvoiceActionTypes.InvoiceOnServerCreated: return {
            ...state
        };
		case InvoiceActionTypes.InvoiceCreated: return adapter.addOne(action.payload.invoice, {
			...state, lastCreatedInvoiceId: action.payload.invoice.id
        });
        case InvoiceActionTypes.InvoiceUpdated: return adapter.updateOne(action.payload.partialInvoice, state);
        case InvoiceActionTypes.InvoicesStatusUpdated: {
            const _partialInvoices: Update<InvoiceModel>[] = [];
            // tslint:disable-next-line:prefer-const
            for (let i = 0; i < action.payload.invoices.length; i++) {
                _partialInvoices.push({
				    id: action.payload.invoices[i].id,
				    changes: {
                        status: action.payload.status
                    }
			    });
            }
            return adapter.updateMany(_partialInvoices, state);
        }
        case InvoiceActionTypes.OneInvoiceDeleted: return adapter.removeOne(action.payload.id, state);
        case InvoiceActionTypes.ManyInvoicesDeleted: return adapter.removeMany(action.payload.ids, state);
        case InvoiceActionTypes.InvoicesPageCancelled: {
            return {
                ...state, listLoading: false, lastQuery: new QueryParamsModel({})
            };
        }
        case InvoiceActionTypes.InvoicesPageLoaded: {
            return adapter.addMany(action.payload.invoices, {
                ...initialInvoicesState,
                totalCount: action.payload.totalCount,
                listLoading: false,
                lastQuery: action.payload.page,
                showInitWaitingMessage: false
            });
        }
        default: return state;
    }
}

export const getInvoiceState = createFeatureSelector<InvoiceModel>('invoices');

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal
} = adapter.getSelectors();
