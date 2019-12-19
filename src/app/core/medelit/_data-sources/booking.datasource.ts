import { mergeMap, tap } from 'rxjs/operators';
// RxJS
import { delay, distinctUntilChanged, skip, filter, take, map } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../../_base/crud';
// State
import { AppState } from '../../reducers';
import { selectBookingsInStore, selectBookingsPageLoading, selectBookingsShowInitWaitingMessage } from '../_selectors/booking.selectors';

export class BookingDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectBookingsPageLoading),
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectBookingsShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectBookingsInStore),
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
