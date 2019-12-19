import { QueryParamsModel } from './../../_base/crud/models/query-models/query-params.model';
import { forkJoin } from 'rxjs';
// Angular
import { Injectable } from '@angular/core';
// RxJS
import { mergeMap, map, tap, delay } from 'rxjs/operators';
// NGRX
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
// CRUD
import { QueryResultsModel } from '../../_base/crud';
// Services
import { BookingService } from '../_services/';
// State
import { AppState } from '../../../core/reducers';
// Actions
import {
    BookingActionTypes,
    BookingsPageRequested,
    BookingsPageLoaded,
    ManyBookingsDeleted,
    OneBookingDeleted,
    BookingActionToggleLoading,
    BookingsPageToggleLoading,
    BookingUpdated,
    BookingsStatusUpdated,
    BookingCreated,
    BookingOnServerCreated
} from '../_actions/booking.actions';
import { of } from 'rxjs';

@Injectable()
export class BookingEffects {
    showPageLoadingDistpatcher = new BookingsPageToggleLoading({ isLoading: true });
    showActionLoadingDistpatcher = new BookingActionToggleLoading({ isLoading: true });
    hideActionLoadingDistpatcher = new BookingActionToggleLoading({ isLoading: false });

    @Effect()
    loadBookingsPage$ = this.actions$.pipe(
        ofType<BookingsPageRequested>(BookingActionTypes.BookingsPageRequested),
        mergeMap(( { payload } ) => {
            this.store.dispatch(this.showPageLoadingDistpatcher);
            const requestToServer = this.bookingsService.findBookings(payload.page);
            const lastQuery = of(payload.page);
            return forkJoin(requestToServer, lastQuery);
        }),
        map(response => {
            const result: QueryResultsModel = response[0].data;
            const lastQuery: QueryParamsModel = response[1];
            const pageLoadedDispatch = new BookingsPageLoaded({
                bookings: result.items,
                totalCount: result.totalCount,
                page: lastQuery
            });
            return pageLoadedDispatch;
        })
    );

    @Effect()
    deleteBooking$ = this.actions$
        .pipe(
            ofType<OneBookingDeleted>(BookingActionTypes.OneBookingDeleted),
            mergeMap(( { payload } ) => {
                    this.store.dispatch(this.showActionLoadingDistpatcher);
                    return this.bookingsService.deleteBooking(payload.id);
                }
            ),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            }),
        );

    @Effect()
    deleteBookings$ = this.actions$
        .pipe(
            ofType<ManyBookingsDeleted>(BookingActionTypes.ManyBookingsDeleted),
            mergeMap(( { payload } ) => {
                    this.store.dispatch(this.showActionLoadingDistpatcher);
                    return this.bookingsService.deleteBookings(payload.ids);
                }
            ),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            }),
        );

    @Effect()
    updateBooking$ = this.actions$
        .pipe(
            ofType<BookingUpdated>(BookingActionTypes.BookingUpdated),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showActionLoadingDistpatcher);
                return this.bookingsService.updateBooking(payload.booking);
            }),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            })
        );

    @Effect()
    updateBookingsStatus$ = this.actions$
        .pipe(
            ofType<BookingsStatusUpdated>(BookingActionTypes.BookingsStatusUpdated),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showActionLoadingDistpatcher);
                return this.bookingsService.updateStatusForBooking(payload.bookings, payload.status);
            }),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            })
        );

    @Effect()
    createBooking$ = this.actions$
        .pipe(
            ofType<BookingOnServerCreated>(BookingActionTypes.BookingOnServerCreated),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showActionLoadingDistpatcher);
                return this.bookingsService.createBooking(payload.booking).pipe(
                    tap(res => {
                        this.store.dispatch(new BookingCreated({ booking: res }));
                    })
                );
            }),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            }),
        );

    constructor(private actions$: Actions, private bookingsService: BookingService, private store: Store<AppState>) { }
}
