// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { QueryParamsModel } from '../../_base/crud';
// Models
import { InvoiceEntityModel } from '..';

export enum InvoiceEntityActionTypes {
	InvoiceEntityOnServerCreated = '[Edit Invoice Entity Dialog] Invoice Entity On Server Created',
	InvoiceEntityCreated = '[Edit Invoice Entity Dialog] Invoice Entity Created',
	InvoiceEntityUpdated = '[Edit Invoice Entity Dialog] Invoice Entity Updated',
	InvoiceEntitiesStatusUpdated = '[Invoice Entity List Page] Invoice Entities Status Updated',
	OneInvoiceEntityDeleted = '[Invoice Entities List Page] One Invoice Entity Deleted',
	ManyInvoiceEntitiesDeleted = '[Invoice Entities List Page] Many Invoice Entity Deleted',
	InvoiceEntitiesPageRequested = '[Invoice Entities List Page] Invoice Entities Page Requested',
	InvoiceEntitiesPageLoaded = '[Invoice Entities API] Invoice Entities Page Loaded',
	InvoiceEntitiesPageCancelled = '[Invoice Entities API] Invoice Entities Page Cancelled',
	InvoiceEntitiesPageToggleLoading = '[Invoice Entities] Invoice Entities Page Toggle Loading',
	InvoiceEntityActionToggleLoading = '[Invoice Entities] Invoice Entities Action Toggle Loading'
}

export class InvoiceEntityOnServerCreated implements Action {
	readonly type = InvoiceEntityActionTypes.InvoiceEntityOnServerCreated;
	constructor(public payload: { entity: InvoiceEntityModel }) { }
}

export class InvoiceEntityCreated implements Action {
	readonly type = InvoiceEntityActionTypes.InvoiceEntityCreated;
	constructor(public payload: { entity: InvoiceEntityModel }) { }
}

export class InvoiceEntityUpdated implements Action {
	readonly type = InvoiceEntityActionTypes.InvoiceEntityUpdated;
    constructor(public payload: {
		partialEntity: Update<InvoiceEntityModel>, // For State update
		entity: InvoiceEntityModel // For Server update (through service)
    }) { }
}

export class InvoiceEntitiesStatusUpdated implements Action {
	readonly type = InvoiceEntityActionTypes.InvoiceEntitiesStatusUpdated;
    constructor(public payload: {
		entities: InvoiceEntityModel[],
        status: number
    }) { }
}

export class OneInvoiceEntityDeleted implements Action {
	readonly type = InvoiceEntityActionTypes.OneInvoiceEntityDeleted;
    constructor(public payload: { id: number }) {}
}

export class ManyInvoiceEntitiesDeleted implements Action {
	readonly type = InvoiceEntityActionTypes.ManyInvoiceEntitiesDeleted;
    constructor(public payload: { ids: number[] }) {}
}

export class InvoiceEntitiesPageRequested implements Action {
	readonly type = InvoiceEntityActionTypes.InvoiceEntitiesPageRequested;
    constructor(public payload: { page: QueryParamsModel }) { }
}

export class InvoiceEntitiesPageLoaded implements Action {
	readonly type = InvoiceEntityActionTypes.InvoiceEntitiesPageLoaded;
	constructor(public payload: { entities: InvoiceEntityModel[], totalCount: number, page: QueryParamsModel }) { }
}

export class InvoiceEntitiesPageCancelled implements Action {
	readonly type = InvoiceEntityActionTypes.InvoiceEntitiesPageCancelled;
}

export class InvoiceEntitiesPageToggleLoading implements Action {
	readonly type = InvoiceEntityActionTypes.InvoiceEntitiesPageToggleLoading;
    constructor(public payload: { isLoading: boolean }) { }
}

export class InvoiceEntityActionToggleLoading implements Action {
	readonly type = InvoiceEntityActionTypes.InvoiceEntityActionToggleLoading;
    constructor(public payload: { isLoading: boolean }) { }
}

export type InvoiceEntityActions = InvoiceEntityOnServerCreated
	| InvoiceEntityCreated
	| InvoiceEntityUpdated
	| InvoiceEntitiesStatusUpdated
	| OneInvoiceEntityDeleted
	| ManyInvoiceEntitiesDeleted
	| InvoiceEntitiesPageRequested
	| InvoiceEntitiesPageLoaded
	| InvoiceEntitiesPageCancelled
	| InvoiceEntitiesPageToggleLoading
	| InvoiceEntityActionToggleLoading;
