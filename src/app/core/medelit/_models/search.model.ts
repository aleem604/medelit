import { LeadModel } from './lead/lead.model';
import { CustomerModel } from './customer.model';

export interface SearchModel{
	leads: LeadModel[];
	customers: CustomerModel[];
}
