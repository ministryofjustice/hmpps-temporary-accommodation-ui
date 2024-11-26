/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BookingMadeBookedBy } from './BookingMadeBookedBy';
import type { PersonReference } from './PersonReference';
import type { Premises } from './Premises';
export type BookingMade = {
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
    createdAt: string;
    bookedBy: BookingMadeBookedBy;
    premises: Premises;
    arrivalOn: string;
    departureOn: string;
    applicationSubmittedOn?: string;
    releaseType?: string;
    sentenceType?: string;
    situation?: string;
};

