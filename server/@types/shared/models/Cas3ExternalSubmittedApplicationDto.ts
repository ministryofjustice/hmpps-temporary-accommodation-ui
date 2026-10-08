/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas3ExternalLatestBookingDto } from './Cas3ExternalLatestBookingDto';
import type { Cas3ExternalPreviousBookingDto } from './Cas3ExternalPreviousBookingDto';
import type { Cas3StaffDto } from './Cas3StaffDto';
import type { TemporaryAccommodationAssessmentStatus } from './TemporaryAccommodationAssessmentStatus';
export type Cas3ExternalSubmittedApplicationDto = {
    /**
     * Will only be defined if the assessmentStatus is 'rejected'
     */
    assessmentRejectionReason?: string;
    assessmentStatus?: TemporaryAccommodationAssessmentStatus;
    latestBooking?: Cas3ExternalLatestBookingDto;
    previousBookings?: Array<Cas3ExternalPreviousBookingDto>;
    submittedBy: Cas3StaffDto;
    submittedDate: string;
};

