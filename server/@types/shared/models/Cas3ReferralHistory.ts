/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas3StaffDto } from './Cas3StaffDto';
import type { ServiceType } from './ServiceType';
import type { TemporaryAccommodationAssessmentStatus } from './TemporaryAccommodationAssessmentStatus';
export type Cas3ReferralHistory = {
    applicationId: string;
    createdAt: string;
    id: string;
    localAuthorityArea?: string;
    pdu?: string;
    placementAddress?: string;
    placementStatus?: string;
    referralRejectionReason?: string;
    referralRejectionReasonDetail?: string;
    referredBy?: Cas3StaffDto;
    status: TemporaryAccommodationAssessmentStatus;
    type: ServiceType;
};

