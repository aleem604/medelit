import { mergeMap, tap } from 'rxjs/operators';
// RxJS
import { delay, distinctUntilChanged, skip, filter, take, map } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../../_base/crud';
// State
import { AppState } from '../../reducers';
import { selectServicesInStore, selectServicesPageLoading, selectServicesShowInitWaitingMessage } from '../_selectors/service.selectors';

export class ServiceDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectServicesPageLoading),
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectServicesShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectServicesInStore),
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
