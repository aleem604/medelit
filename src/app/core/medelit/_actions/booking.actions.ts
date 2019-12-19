import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';

import { QueryParamsModel } from '../../_base/crud';
import { BookingModel } from '../_models/booking.model';



export enum BookingActionTypes {
    BookingOnServerCreated = '[Edit Booking Dialog] Booking On Server Created',
    BookingCreated = '[Edit Booking Dialog] Booking Created',
    BookingUpdated = '[Edit Booking Dialog] Booking Updated',
    BookingsStatusUpdated = '[Booking List Page] Bookings Status Updated',
    OneBookingDeleted = '[Bookings List Page] One Booking Deleted',
    ManyBookingsDeleted = '[Bookings List Page] Many Booking Deleted',
    BookingsPageRequested = '[Bookings List Page] Bookings Page Requested',
    BookingsPageLoaded = '[Bookings API] Bookings Page Loaded',
    BookingsPageCancelled = '[Bookings API] Bookings Page Cancelled',
    BookingsPageToggleLoading = '[Bookings] Bookings Page Toggle Loading',
    BookingActionToggleLoading = '[Bookings] Bookings Action Toggle Loading'
}

export class BookingOnServerCreated implements Action {
    readonly type = BookingActionTypes.BookingOnServerCreated;
	constructor(public payload: { booking: BookingModel }) { }
}

export class BookingCreated implements Action {
    readonly type = BookingActionTypes.BookingCreated;
	constructor(public payload: { booking: BookingModel }) { }
}

export class BookingUpdated implements Action {
    readonly type = BookingActionTypes.BookingUpdated;
    constructor(public payload: {
		partialBooking: Update<BookingModel>, // For State update
		booking: BookingModel // For Server update (through service)
    }) { }
}

export class BookingsStatusUpdated implements Action {
    readonly type = BookingActionTypes.BookingsStatusUpdated;
    constructor(public payload: {
		bookings: BookingModel[],
        status: number
    }) { }
}

export class OneBookingDeleted implements Action {
    readonly type = BookingActionTypes.OneBookingDeleted;
    constructor(public payload: { id: number }) {}
}

export class ManyBookingsDeleted implements Action {
    readonly type = BookingActionTypes.ManyBookingsDeleted;
    constructor(public payload: { ids: number[] }) {}
}

export class BookingsPageRequested implements Action {
    readonly type = BookingActionTypes.BookingsPageRequested;
    constructor(public payload: { page: QueryParamsModel }) { }
}

export class BookingsPageLoaded implements Action {
    readonly type = BookingActionTypes.BookingsPageLoaded;
	constructor(public payload: { bookings: BookingModel[], totalCount: number, page: QueryParamsModel }) { }
}

export class BookingsPageCancelled implements Action {
    readonly type = BookingActionTypes.BookingsPageCancelled;
}

export class BookingsPageToggleLoading implements Action {
    readonly type = BookingActionTypes.BookingsPageToggleLoading;
    constructor(public payload: { isLoading: boolean }) { }
}

export class BookingActionToggleLoading implements Action {
    readonly type = BookingActionTypes.BookingActionToggleLoading;
    constructor(public payload: { isLoading: boolean }) { }
}

export type BookingActions = BookingOnServerCreated
| BookingCreated
| BookingUpdated
| BookingsStatusUpdated
| OneBookingDeleted
| ManyBookingsDeleted
| BookingsPageRequested
| BookingsPageLoaded
| BookingsPageCancelled
| BookingsPageToggleLoading
| BookingActionToggleLoading;
