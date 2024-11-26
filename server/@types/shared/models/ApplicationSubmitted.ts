/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApplicationSubmittedSubmittedBy } from './ApplicationSubmittedSubmittedBy';
import type { PersonReference } from './PersonReference';
export type ApplicationSubmitted = {
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
    releaseType: string;
    age: number;
    gender: 'Male' | 'Female';
    targetLocation: string;
    submittedAt: string;
    submittedBy: ApplicationSubmittedSubmittedBy;
    mappa?: string;
    sentenceLengthInMonths?: number;
    offenceId?: string;
};

