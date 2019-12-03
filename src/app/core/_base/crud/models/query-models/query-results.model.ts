export class QueryResultsModel {
	// fields
	items: any[];
	data: any = { items: [], totalCount: Number };
	success: boolean;
	totalCount: number;
	errorMessage: string;

	constructor(_items: any[] = [], _totalCount: number = 0, _errorMessage: string = '') {
		this.items = _items;
		this.totalCount = _totalCount;
	}
}
