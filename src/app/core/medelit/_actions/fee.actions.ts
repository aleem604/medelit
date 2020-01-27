// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { QueryParamsModel } from '../../_base/crud';
// Models
import { FeeModel } from '..';

export enum FeeActionTypes {
    FeeOnServerCreated = '[Edit Fee Dialog] Fee On Server Created',
    FeeCreated = '[Edit Fee Dialog] Fee Created',
    FeeUpdated = '[Edit Fee Dialog] Fee Updated',
    FeesStatusUpdated = '[Fee List Page] Fees Status Updated',
    OneFeeDeleted = '[Fees List Page] One Fee Deleted',
    ManyFeesDeleted = '[Fees List Page] Many Fee Deleted',
    FeesPageRequested = '[Fees List Page] Fees Page Requested',
    FeesPageLoaded = '[Fees API] Fees Page Loaded',
    FeesPageCancelled = '[Fees API] Fees Page Cancelled',
    FeesPageToggleLoading = '[Fees] Fees Page Toggle Loading',
    FeeActionToggleLoading = '[Fees] Fees Action Toggle Loading'
}

export class FeeOnServerCreated implements Action {
    readonly type = FeeActionTypes.FeeOnServerCreated;
	constructor(public payload: { fee: FeeModel }) { }
}

export class FeeCreated implements Action {
    readonly type = FeeActionTypes.FeeCreated;
	constructor(public payload: { fee: FeeModel }) { }
}

export class FeeUpdated implements Action {
    readonly type = FeeActionTypes.FeeUpdated;
    constructor(public payload: {
		partialFee: Update<FeeModel>, // For State update
		fee: FeeModel // For Server update (through service)
    }) { }
}

export class FeesStatusUpdated implements Action {
    readonly type = FeeActionTypes.FeesStatusUpdated;
    constructor(public payload: {
		fees: FeeModel[],
        status: number
    }) { }
}

export class OneFeeDeleted implements Action {
    readonly type = FeeActionTypes.OneFeeDeleted;
    constructor(public payload: { id: number, feeTypeId: number }) {}
}

export class ManyFeesDeleted implements Action {
    readonly type = FeeActionTypes.ManyFeesDeleted;
    constructor(public payload: { ids: FeeModel[] }) {}
}

export class FeesPageRequested implements Action {
    readonly type = FeeActionTypes.FeesPageRequested;
    constructor(public payload: { page: QueryParamsModel }) { }
}

export class FeesPageLoaded implements Action {
    readonly type = FeeActionTypes.FeesPageLoaded;
	constructor(public payload: { fees: FeeModel[], totalCount: number, page: QueryParamsModel }) { }
}

export class FeesPageCancelled implements Action {
    readonly type = FeeActionTypes.FeesPageCancelled;
}

export class FeesPageToggleLoading implements Action {
    readonly type = FeeActionTypes.FeesPageToggleLoading;
    constructor(public payload: { isLoading: boolean }) { }
}

export class FeeActionToggleLoading implements Action {
    readonly type = FeeActionTypes.FeeActionToggleLoading;
    constructor(public payload: { isLoading: boolean }) { }
}

export type FeeActions = FeeOnServerCreated
| FeeCreated
| FeeUpdated
| FeesStatusUpdated
| OneFeeDeleted
| ManyFeesDeleted
| FeesPageRequested
| FeesPageLoaded
| FeesPageCancelled
| FeesPageToggleLoading
| FeeActionToggleLoading;
