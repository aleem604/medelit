import { Store, select } from '@ngrx/store';
import { BaseDataSource, QueryResultsModel } from '../../_base/crud';
import { AppState } from '../../reducers';
import { selectInvoiceEntitiesInStore, selectInvoiceEntitiesPageLoading, selectInvoiceEntitiesShowInitWaitingMessage } from '../_selectors/invoice-entity.selectors';

export class InvoiceEntityDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectInvoiceEntitiesPageLoading),
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectInvoiceEntitiesShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectInvoiceEntitiesInStore),
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
