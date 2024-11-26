/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PersonReference } from './PersonReference';
import type { StaffMember } from './StaffMember';
export type RequestForPlacementCreated = {
    /**
     * The UUID of an application for an AP place
     */
    applicationId: string;
    /**
     * The URL on the Approved Premises service at which a user can view a representation of an AP application and related resources, including bookings
     */
    applicationUrl: string;
    personReference: PersonReference;
    /**
     * Used in Delius to identify the 'event' via the first active conviction's 'index'
     */
    deliusEventNumber: string;
    /**
     * The UUID of a request for placement. Currently a proxy for PlacementApplicationId
     */
    requestForPlacementId: string;
    createdAt: string;
    expectedArrival: string;
    duration: number;
    requestForPlacementType: 'initial' | 'rotl' | 'releaseFollowingDecisions' | 'additionalPlacement';
    createdBy?: StaffMember;
};

