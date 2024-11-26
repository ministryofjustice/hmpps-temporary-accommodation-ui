/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DatePeriod } from './DatePeriod';
import type { PersonReference } from './PersonReference';
import type { WithdrawnBy } from './WithdrawnBy';
export type PlacementApplicationWithdrawn = {
    /**
     * The UUID of an application for an AP place
     */
    applicationId: string;
    /**
     * The URL on the Approved Premises service at which a user can view a representation of an AP application and related resources, including bookings
     */
    applicationUrl: string;
    /**
     * The UUID of a placement application
     */
    placementApplicationId: string;
    personReference: PersonReference;
    /**
     * Used in Delius to identify the 'event' via the first active conviction's 'index'
     */
    deliusEventNumber: string;
    withdrawnAt: string;
    withdrawnBy: WithdrawnBy;
    withdrawalReason: string;
    placementDates?: Array<DatePeriod>;
};

