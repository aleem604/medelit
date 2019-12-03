// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { QueryParamsModel } from '../../_base/crud';
// Models
import { LeadModel } from '..';

export enum LeadActionTypes {
    LeadOnServerCreated = '[Edit Lead Dialog] Lead On Server Created',
    LeadCreated = '[Edit Lead Dialog] Lead Created',
    LeadUpdated = '[Edit Lead Dialog] Lead Updated',
    LeadsStatusUpdated = '[Lead List Page] Leads Status Updated',
    OneLeadDeleted = '[Leads List Page] One Lead Deleted',
    ManyLeadsDeleted = '[Leads List Page] Many Lead Deleted',
    LeadsPageRequested = '[Leads List Page] Leads Page Requested',
    LeadsPageLoaded = '[Leads API] Leads Page Loaded',
    LeadsPageCancelled = '[Leads API] Leads Page Cancelled',
    LeadsPageToggleLoading = '[Leads] Leads Page Toggle Loading',
    LeadActionToggleLoading = '[Leads] Leads Action Toggle Loading'
}

export class LeadOnServerCreated implements Action {
    readonly type = LeadActionTypes.LeadOnServerCreated;
	constructor(public payload: { lead: LeadModel }) { }
}

export class LeadCreated implements Action {
    readonly type = LeadActionTypes.LeadCreated;
	constructor(public payload: { lead: LeadModel }) { }
}

export class LeadUpdated implements Action {
    readonly type = LeadActionTypes.LeadUpdated;
    constructor(public payload: {
		partialLead: Update<LeadModel>, // For State update
		lead: LeadModel // For Server update (through service)
    }) { }
}

export class LeadsStatusUpdated implements Action {
    readonly type = LeadActionTypes.LeadsStatusUpdated;
    constructor(public payload: {
		leads: LeadModel[],
        status: number
    }) { }
}

export class OneLeadDeleted implements Action {
    readonly type = LeadActionTypes.OneLeadDeleted;
    constructor(public payload: { id: number }) {}
}

export class ManyLeadsDeleted implements Action {
    readonly type = LeadActionTypes.ManyLeadsDeleted;
    constructor(public payload: { ids: number[] }) {}
}

export class LeadsPageRequested implements Action {
    readonly type = LeadActionTypes.LeadsPageRequested;
    constructor(public payload: { page: QueryParamsModel }) { }
}

export class LeadsPageLoaded implements Action {
    readonly type = LeadActionTypes.LeadsPageLoaded;
	constructor(public payload: { leads: LeadModel[], totalCount: number, page: QueryParamsModel }) { }
}

export class LeadsPageCancelled implements Action {
    readonly type = LeadActionTypes.LeadsPageCancelled;
}

export class LeadsPageToggleLoading implements Action {
    readonly type = LeadActionTypes.LeadsPageToggleLoading;
    constructor(public payload: { isLoading: boolean }) { }
}

export class LeadActionToggleLoading implements Action {
    readonly type = LeadActionTypes.LeadActionToggleLoading;
    constructor(public payload: { isLoading: boolean }) { }
}

export type LeadActions = LeadOnServerCreated
| LeadCreated
| LeadUpdated
| LeadsStatusUpdated
| OneLeadDeleted
| ManyLeadsDeleted
| LeadsPageRequested
| LeadsPageLoaded
| LeadsPageCancelled
| LeadsPageToggleLoading
| LeadActionToggleLoading;
