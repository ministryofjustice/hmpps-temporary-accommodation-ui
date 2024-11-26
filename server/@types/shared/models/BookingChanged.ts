/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PersonReference } from './PersonReference';
import type { Premises } from './Premises';
import type { StaffMember } from './StaffMember';
export type BookingChanged = {
    /**
     * The UUID of an application for an AP place
     */
    applicationId: string;
    /**
     * The URL on the Approved Premises service at which a user can view a representation of an AP application and related resources, including bookings
     */
    applicationUrl: string;
    /**
     * The UUID of booking for an AP place
     */
    bookingId: string;
    personReference: PersonReference;
    /**
     * Used in Delius to identify the 'event' via the first active conviction's 'index'
     */
    deliusEventNumber: string;
    changedAt: string;
    changedBy: StaffMember;
    premises: Premises;
    arrivalOn: string;
    departureOn: string;
};

