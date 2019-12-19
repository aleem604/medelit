// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter, Update } from '@ngrx/entity';
// Actions
import { BookingActions, BookingActionTypes } from '../_actions/booking.actions';
// Models
import { BookingModel } from '../_models/booking.model';
import { QueryParamsModel } from '../../_base/crud';

export interface BookingsState extends EntityState<BookingModel> {
    listLoading: boolean;
    actionsloading: boolean;
    totalCount: number;
    lastCreatedBookingId: number;
    lastQuery: QueryParamsModel;
    showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<BookingModel> = createEntityAdapter<BookingModel>();

export const initialBookingsState: BookingsState = adapter.getInitialState({
    bookingForEdit: null,
    listLoading: false,
    actionsloading: false,
    totalCount: 0,
    lastCreatedBookingId: undefined,
    lastQuery: new QueryParamsModel({}),
    showInitWaitingMessage: true
});

export function bookingsReducer(state = initialBookingsState, action: BookingActions): BookingsState {
    switch  (action.type) {
        case BookingActionTypes.BookingsPageToggleLoading: {
            return {
                ...state, listLoading: action.payload.isLoading, lastCreatedBookingId: undefined
            };
        }
        case BookingActionTypes.BookingActionToggleLoading: {
            return {
                ...state, actionsloading: action.payload.isLoading
            };
        }
        case BookingActionTypes.BookingOnServerCreated: return {
            ...state
        };
		case BookingActionTypes.BookingCreated: return adapter.addOne(action.payload.booking, {
			...state, lastCreatedBookingId: action.payload.booking.id
        });
        case BookingActionTypes.BookingUpdated: return adapter.updateOne(action.payload.partialBooking, state);
        case BookingActionTypes.BookingsStatusUpdated: {
            const _partialBookings: Update<BookingModel>[] = [];
            // tslint:disable-next-line:prefer-const
            for (let i = 0; i < action.payload.bookings.length; i++) {
                _partialBookings.push({
				    id: action.payload.bookings[i].id,
				    changes: {
                        status: action.payload.status
                    }
			    });
            }
            return adapter.updateMany(_partialBookings, state);
        }
        case BookingActionTypes.OneBookingDeleted: return adapter.removeOne(action.payload.id, state);
        case BookingActionTypes.ManyBookingsDeleted: return adapter.removeMany(action.payload.ids, state);
        case BookingActionTypes.BookingsPageCancelled: {
            return {
                ...state, listLoading: false, lastQuery: new QueryParamsModel({})
            };
        }
        case BookingActionTypes.BookingsPageLoaded: {
            return adapter.addMany(action.payload.bookings, {
                ...initialBookingsState,
                totalCount: action.payload.totalCount,
                listLoading: false,
                lastQuery: action.payload.page,
                showInitWaitingMessage: false
            });
        }
        default: return state;
    }
}

export const getBookingState = createFeatureSelector<BookingModel>('bookings');

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal
} = adapter.getSelectors();
