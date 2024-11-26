/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PersonReference } from './PersonReference';
import type { StaffMember } from './StaffMember';
export type CAS3BookingConfirmedEventDetails = {
    personReference: PersonReference;
    bookingId: string;
    bookingUrl: string;
    expectedArrivedAt: string;
    notes: string;
    applicationId?: string;
    applicationUrl?: string;
    confirmedBy?: StaffMember;
};

