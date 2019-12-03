// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { QueryParamsModel } from '../../_base/crud';
// Models
import { ProfessionalModel } from '..';

export enum ProfessionalActionTypes {
    ProfessionalOnServerCreated = '[Edit Professional Dialog] Professional On Server Created',
    ProfessionalCreated = '[Edit Professional Dialog] Professional Created',
    ProfessionalUpdated = '[Edit Professional Dialog] Professional Updated',
    ProfessionalsStatusUpdated = '[Professional List Page] Professionals Status Updated',
    OneProfessionalDeleted = '[Professionals List Page] One Professional Deleted',
    ManyProfessionalsDeleted = '[Professionals List Page] Many Professional Deleted',
    ProfessionalsPageRequested = '[Professionals List Page] Professionals Page Requested',
    ProfessionalsPageLoaded = '[Professionals API] Professionals Page Loaded',
    ProfessionalsPageCancelled = '[Professionals API] Professionals Page Cancelled',
    ProfessionalsPageToggleLoading = '[Professionals] Professionals Page Toggle Loading',
    ProfessionalActionToggleLoading = '[Professionals] Professionals Action Toggle Loading'
}

export class ProfessionalOnServerCreated implements Action {
    readonly type = ProfessionalActionTypes.ProfessionalOnServerCreated;
	constructor(public payload: { professional: ProfessionalModel }) { }
}

export class ProfessionalCreated implements Action {
    readonly type = ProfessionalActionTypes.ProfessionalCreated;
	constructor(public payload: { professional: ProfessionalModel }) { }
}

export class ProfessionalUpdated implements Action {
    readonly type = ProfessionalActionTypes.ProfessionalUpdated;
    constructor(public payload: {
		partialProfessional: Update<ProfessionalModel>, // For State update
		professional: ProfessionalModel // For Server update (through service)
    }) { }
}

export class ProfessionalsStatusUpdated implements Action {
    readonly type = ProfessionalActionTypes.ProfessionalsStatusUpdated;
    constructor(public payload: {
		professionals: ProfessionalModel[],
        status: number
    }) { }
}

export class OneProfessionalDeleted implements Action {
    readonly type = ProfessionalActionTypes.OneProfessionalDeleted;
    constructor(public payload: { id: number }) {}
}

export class ManyProfessionalsDeleted implements Action {
    readonly type = ProfessionalActionTypes.ManyProfessionalsDeleted;
    constructor(public payload: { ids: number[] }) {}
}

export class ProfessionalsPageRequested implements Action {
    readonly type = ProfessionalActionTypes.ProfessionalsPageRequested;
    constructor(public payload: { page: QueryParamsModel }) { }
}

export class ProfessionalsPageLoaded implements Action {
    readonly type = ProfessionalActionTypes.ProfessionalsPageLoaded;
	constructor(public payload: { professionals: ProfessionalModel[], totalCount: number, page: QueryParamsModel }) { }
}

export class ProfessionalsPageCancelled implements Action {
    readonly type = ProfessionalActionTypes.ProfessionalsPageCancelled;
}

export class ProfessionalsPageToggleLoading implements Action {
    readonly type = ProfessionalActionTypes.ProfessionalsPageToggleLoading;
    constructor(public payload: { isLoading: boolean }) { }
}

export class ProfessionalActionToggleLoading implements Action {
    readonly type = ProfessionalActionTypes.ProfessionalActionToggleLoading;
    constructor(public payload: { isLoading: boolean }) { }
}

export type ProfessionalActions = ProfessionalOnServerCreated
| ProfessionalCreated
| ProfessionalUpdated
| ProfessionalsStatusUpdated
| OneProfessionalDeleted
| ManyProfessionalsDeleted
| ProfessionalsPageRequested
| ProfessionalsPageLoaded
| ProfessionalsPageCancelled
| ProfessionalsPageToggleLoading
| ProfessionalActionToggleLoading;
