import { mergeMap, tap } from 'rxjs/operators';
// RxJS
import { delay, distinctUntilChanged, skip, filter, take, map } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../../_base/crud';
// State
import { AppState } from '../../reducers';
import { selectFieldsInStore, selectFieldsPageLoading, selectFieldsShowInitWaitingMessage } from '../_selectors/field.selectors';

export class FieldDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectFieldsPageLoading),
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectFieldsShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectFieldsInStore),
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
