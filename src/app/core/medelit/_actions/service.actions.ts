// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { QueryParamsModel } from '../../_base/crud';
// Models
import { ServiceModel } from '..';

export enum ServiceActionTypes {
    ServiceOnServerCreated = '[Edit Service Dialog] Service On Server Created',
    ServiceCreated = '[Edit Service Dialog] Service Created',
    ServiceUpdated = '[Edit Service Dialog] Service Updated',
    ServicesStatusUpdated = '[Service List Page] Services Status Updated',
    OneServiceDeleted = '[Services List Page] One Service Deleted',
    ManyServicesDeleted = '[Services List Page] Many Service Deleted',
    ServicesPageRequested = '[Services List Page] Services Page Requested',
    ServicesPageLoaded = '[Services API] Services Page Loaded',
    ServicesPageCancelled = '[Services API] Services Page Cancelled',
    ServicesPageToggleLoading = '[Services] Services Page Toggle Loading',
    ServiceActionToggleLoading = '[Services] Services Action Toggle Loading'
}

export class ServiceOnServerCreated implements Action {
    readonly type = ServiceActionTypes.ServiceOnServerCreated;
	constructor(public payload: { service: ServiceModel }) { }
}

export class ServiceCreated implements Action {
    readonly type = ServiceActionTypes.ServiceCreated;
	constructor(public payload: { service: ServiceModel }) { }
}

export class ServiceUpdated implements Action {
    readonly type = ServiceActionTypes.ServiceUpdated;
    constructor(public payload: {
		partialService: Update<ServiceModel>, // For State update
		service: ServiceModel // For Server update (through service)
    }) { }
}

export class ServicesStatusUpdated implements Action {
    readonly type = ServiceActionTypes.ServicesStatusUpdated;
    constructor(public payload: {
		services: ServiceModel[],
        status: number
    }) { }
}

export class OneServiceDeleted implements Action {
    readonly type = ServiceActionTypes.OneServiceDeleted;
    constructor(public payload: { id: number }) {}
}

export class ManyServicesDeleted implements Action {
    readonly type = ServiceActionTypes.ManyServicesDeleted;
    constructor(public payload: { ids: number[] }) {}
}

export class ServicesPageRequested implements Action {
    readonly type = ServiceActionTypes.ServicesPageRequested;
    constructor(public payload: { page: QueryParamsModel }) { }
}

export class ServicesPageLoaded implements Action {
    readonly type = ServiceActionTypes.ServicesPageLoaded;
	constructor(public payload: { services: ServiceModel[], totalCount: number, page: QueryParamsModel }) { }
}

export class ServicesPageCancelled implements Action {
    readonly type = ServiceActionTypes.ServicesPageCancelled;
}

export class ServicesPageToggleLoading implements Action {
    readonly type = ServiceActionTypes.ServicesPageToggleLoading;
    constructor(public payload: { isLoading: boolean }) { }
}

export class ServiceActionToggleLoading implements Action {
    readonly type = ServiceActionTypes.ServiceActionToggleLoading;
    constructor(public payload: { isLoading: boolean }) { }
}

export type ServiceActions = ServiceOnServerCreated
| ServiceCreated
| ServiceUpdated
| ServicesStatusUpdated
| OneServiceDeleted
| ManyServicesDeleted
| ServicesPageRequested
| ServicesPageLoaded
| ServicesPageCancelled
| ServicesPageToggleLoading
| ServiceActionToggleLoading;
