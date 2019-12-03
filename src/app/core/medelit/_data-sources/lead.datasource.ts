import { mergeMap, tap } from 'rxjs/operators';
// RxJS
import { delay, distinctUntilChanged, skip, filter, take, map } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../../_base/crud';
// State
import { AppState } from '../../reducers';
import { selectLeadsInStore, selectLeadsPageLoading, selectLeadsShowInitWaitingMessage } from '../_selectors/lead.selectors';

export class LeadDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectLeadsPageLoading),
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectLeadsShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectLeadsInStore),
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
