/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PersonReference } from './PersonReference';
import type { StaffMember } from './StaffMember';
export type FurtherInformationRequested = {
    /**
     * The UUID of an assessment of an application for an AP place
     */
    assessmentId: string;
    /**
     * The URL on the Approved Premises service at which a user can view a representation of an AP assessment and related resources, including bookings
     */
    assessmentUrl: string;
    /**
     * The UUID of an application for an AP place
     */
    applicationId: string;
    /**
     * The URL on the Approved Premises service at which a user can view a representation of an AP application and related resources, including bookings
     */
    applicationUrl: string;
    personReference: PersonReference;
    requestedAt: string;
    requester: StaffMember;
    recipient: StaffMember;
    /**
     * The UUID of an application for an AP place
     */
    requestId: string;
};

