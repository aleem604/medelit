import { mergeMap, tap } from 'rxjs/operators';
// RxJS
import { delay, distinctUntilChanged, skip, filter, take, map } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../../_base/crud';
// State
import { AppState } from '../../reducers';
import { selectFeesInStore, selectFeesPageLoading, selectFeesInitWaitingMessage } from '../_selectors/fee.selectors';

export class FeesDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectFeesPageLoading),
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectFeesInitWaitingMessage)
		);

		this.store.pipe(
			select(selectFeesInStore),
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
