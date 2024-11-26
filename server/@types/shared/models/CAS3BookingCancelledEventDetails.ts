/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PersonReference } from './PersonReference';
import type { StaffMember } from './StaffMember';
export type CAS3BookingCancelledEventDetails = {
    personReference: PersonReference;
    bookingId: string;
    bookingUrl: string;
    cancellationReason: string;
    applicationId?: string;
    applicationUrl?: string;
    cancelledAt?: string;
    notes?: string;
    cancelledBy?: StaffMember;
};

