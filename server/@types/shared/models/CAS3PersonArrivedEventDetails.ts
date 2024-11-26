/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PersonReference } from './PersonReference';
import type { Premises } from './Premises';
import type { StaffMember } from './StaffMember';
export type CAS3PersonArrivedEventDetails = {
    personReference: PersonReference;
    deliusEventNumber: string;
    bookingId: string;
    bookingUrl: string;
    premises: Premises;
    arrivedAt: string;
    expectedDepartureOn: string;
    notes: string;
    applicationId?: string;
    applicationUrl?: string;
    recordedBy?: StaffMember;
};

