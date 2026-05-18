/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApplicationStatus } from './ApplicationStatus';
import type { Cas3BookingStatus } from './Cas3BookingStatus';
import type { TemporaryAccommodationAssessmentStatus } from './TemporaryAccommodationAssessmentStatus';
export type Cas3SuitableApplication = {
    applicationStatus: ApplicationStatus;
    assessmentStatus?: TemporaryAccommodationAssessmentStatus;
    bookingStatus?: Cas3BookingStatus;
    id: string;
};

