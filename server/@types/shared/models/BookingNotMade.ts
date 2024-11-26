/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BookingMadeBookedBy } from './BookingMadeBookedBy';
import type { PersonReference } from './PersonReference';
export type BookingNotMade = {
    personReference: PersonReference;
    /**
     * Used in Delius to identify the 'event' via the first active conviction's 'index'
     */
    deliusEventNumber: string;
    /**
     * The UUID of an application for an AP place
     */
    applicationId: string;
    /**
     * The URL on the Approved Premises service at which a user can view a representation of an AP application and related resources, including bookings
     */
    applicationUrl: string;
    attemptedAt: string;
    attemptedBy: BookingMadeBookedBy;
    failureDescription?: string;
};

