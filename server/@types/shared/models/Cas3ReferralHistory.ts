/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApplicationStatus } from './ApplicationStatus';
import type { Cas3BookingStatus } from './Cas3BookingStatus';
import type { Cas3StaffDto } from './Cas3StaffDto';
import type { ServiceType } from './ServiceType';
import type { TemporaryAccommodationAssessmentStatus } from './TemporaryAccommodationAssessmentStatus';
export type Cas3ReferralHistory = {
    applicationId: string;
    applicationStatus: ApplicationStatus;
    assessmentStatus?: TemporaryAccommodationAssessmentStatus;
    bookingStatus?: Cas3BookingStatus;
    createdAt: string;
    id: string;
    localAuthorityArea?: string;
    pdu?: string;
    placementAddress?: string;
    referralRejectionReason?: string;
    referralRejectionReasonDetail?: string;
    referredBy: Cas3StaffDto;
    type: ServiceType;
    uiUrl: string;
};

