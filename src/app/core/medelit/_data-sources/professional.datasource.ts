// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../../_base/crud';
// State
import { AppState } from '../../reducers';
import { selectProfessionalsInStore, selectProfessionalsPageLoading, selectProfessionalsInitWaitingMessage } from '../_selectors/professional.selectors';

export class ProfessionalDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectProfessionalsPageLoading),
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectProfessionalsInitWaitingMessage)
		);

		this.store.pipe(
			select(selectProfessionalsInStore),
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
