/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PersonReference } from './PersonReference';
import type { Premises } from './Premises';
import type { StaffMember } from './StaffMember';
export type CAS3PersonDepartedEventDetails = {
    personReference: PersonReference;
    deliusEventNumber: string;
    bookingId: string;
    bookingUrl: string;
    premises: Premises;
    departedAt: string;
    reason: string;
    notes: string;
    applicationId?: string;
    applicationUrl?: string;
    reasonDetail?: string;
    recordedBy?: StaffMember;
};

