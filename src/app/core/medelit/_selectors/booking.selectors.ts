// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// Lodash
import { each } from 'lodash';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
// State
import { BookingsState } from '../_reducers/booking.reducers';
import { BookingModel } from '../_models/booking.model';

export const selectBookingsState = createFeatureSelector<BookingsState>('bookings');

export const selectBookingById = (bookingId: number) => createSelector(
    selectBookingsState,
    bookingsState => bookingsState.entities[bookingId]
);

export const selectBookingsPageLoading = createSelector(
    selectBookingsState,
	bookingsState => bookingsState.listLoading
);

export const selectBookingsActionLoading = createSelector(
    selectBookingsState,
    bookingsState => bookingsState.actionsloading
);

export const selectBookingsPageLastQuery = createSelector(
	selectBookingsState,
	bookingsState => bookingsState.lastQuery
);

export const selectLastCreatedBookingId = createSelector(
    selectBookingsState,
	bookingsState => bookingsState.lastCreatedBookingId
);

export const selectBookingsShowInitWaitingMessage = createSelector(
    selectBookingsState,
    bookingsState => bookingsState.showInitWaitingMessage
);

export const selectBookingsInStore = createSelector(
    selectBookingsState,
    bookingsState => {
		const items: BookingModel[] = [];
        each(bookingsState.entities, element => {
            items.push(element);
        });
        const httpExtension = new HttpExtenstionsModel();
		const result: BookingModel[] = httpExtension.sortArray(items, bookingsState.lastQuery.sortField, bookingsState.lastQuery.sortOrder);
		return new QueryResultsModel(result, bookingsState.totalCount, '');
    }
);
