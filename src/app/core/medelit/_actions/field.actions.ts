// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { QueryParamsModel } from '../../_base/crud';
// Models
import { FieldModel } from '..';

export enum FieldActionTypes {
    FieldOnServerCreated = '[Edit Field Dialog] Field On Server Created',
    FieldCreated = '[Edit Field Dialog] Field Created',
    FieldUpdated = '[Edit Field Dialog] Field Updated',
    FieldsStatusUpdated = '[Field List Page] Fields Status Updated',
    OneFieldDeleted = '[Fields List Page] One Field Deleted',
    ManyFieldsDeleted = '[Fields List Page] Many Field Deleted',
    FieldsPageRequested = '[Fields List Page] Fields Page Requested',
    FieldsPageLoaded = '[Fields API] Fields Page Loaded',
    FieldsPageCancelled = '[Fields API] Fields Page Cancelled',
    FieldsPageToggleLoading = '[Fields] Fields Page Toggle Loading',
    FieldActionToggleLoading = '[Fields] Fields Action Toggle Loading'
}

export class FieldOnServerCreated implements Action {
    readonly type = FieldActionTypes.FieldOnServerCreated;
	constructor(public payload: { field: FieldModel }) { }
}

export class FieldCreated implements Action {
    readonly type = FieldActionTypes.FieldCreated;
	constructor(public payload: { field: FieldModel }) { }
}

export class FieldUpdated implements Action {
    readonly type = FieldActionTypes.FieldUpdated;
    constructor(public payload: {
		partialField: Update<FieldModel>, // For State update
		field: FieldModel // For Server update (through service)
    }) { }
}

export class FieldsStatusUpdated implements Action {
    readonly type = FieldActionTypes.FieldsStatusUpdated;
    constructor(public payload: {
		fields: FieldModel[],
        status: number
    }) { }
}

export class OneFieldDeleted implements Action {
    readonly type = FieldActionTypes.OneFieldDeleted;
    constructor(public payload: { id: number }) {}
}

export class ManyFieldsDeleted implements Action {
    readonly type = FieldActionTypes.ManyFieldsDeleted;
    constructor(public payload: { ids: number[] }) {}
}

export class FieldsPageRequested implements Action {
    readonly type = FieldActionTypes.FieldsPageRequested;
    constructor(public payload: { page: QueryParamsModel }) { }
}

export class FieldsPageLoaded implements Action {
    readonly type = FieldActionTypes.FieldsPageLoaded;
	constructor(public payload: { fields: FieldModel[], totalCount: number, page: QueryParamsModel }) { }
}

export class FieldsPageCancelled implements Action {
    readonly type = FieldActionTypes.FieldsPageCancelled;
}

export class FieldsPageToggleLoading implements Action {
    readonly type = FieldActionTypes.FieldsPageToggleLoading;
    constructor(public payload: { isLoading: boolean }) { }
}

export class FieldActionToggleLoading implements Action {
    readonly type = FieldActionTypes.FieldActionToggleLoading;
    constructor(public payload: { isLoading: boolean }) { }
}

export type FieldActions = FieldOnServerCreated
| FieldCreated
| FieldUpdated
| FieldsStatusUpdated
| OneFieldDeleted
| ManyFieldsDeleted
| FieldsPageRequested
| FieldsPageLoaded
| FieldsPageCancelled
| FieldsPageToggleLoading
| FieldActionToggleLoading;
