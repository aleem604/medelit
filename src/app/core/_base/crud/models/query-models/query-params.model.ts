export class QueryParamsModel {
	// fields
	filter: any;
	sortOrder: string; // asc || desc
	sortField: string;
	pageNumber: number;
	pageSize: number;
	searchOnly: boolean;

	// constructor overrides
	constructor(_filter: any,
		_sortOrder: string = 'asc',
		_sortField: string = '',
		_pageNumber: number = 0,
		_pageSize: number = 10,
		_searchOnly = false) {
		this.filter = _filter;
		this.sortOrder = _sortOrder;
		this.sortField = _sortField;
		this.pageNumber = _pageNumber;
		this.pageSize = _pageSize;
		this.searchOnly = _searchOnly;
	}
}
