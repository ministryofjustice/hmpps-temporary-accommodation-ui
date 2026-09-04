/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApplicationStatus } from './ApplicationStatus';
import type { Cas3BookingStatus } from './Cas3BookingStatus';
import type { Cas3ExternalLatestBookingDto } from './Cas3ExternalLatestBookingDto';
import type { Cas3ExternalPreviousBookingDto } from './Cas3ExternalPreviousBookingDto';
import type { Cas3StaffDto } from './Cas3StaffDto';
import type { TemporaryAccommodationAssessmentStatus } from './TemporaryAccommodationAssessmentStatus';
export type Cas3SuitableApplication = {
    applicationRejectedReason?: string;
    applicationStatus: ApplicationStatus;
    applicationSubmittedBy: Cas3StaffDto;
    applicationSubmittedDate?: string;
    assessmentStatus?: TemporaryAccommodationAssessmentStatus;
    bookingProvisionalOfferSentDate?: string;
    bookingStatus?: Cas3BookingStatus;
    id: string;
    /**
     * This is the most recent booking for the application, could arguably be named 'latestBooking' or 'mostRecentBooking' but 'premises' is the name used in SAS.
     */
    premises?: Cas3ExternalLatestBookingDto;
    previousBookings?: Array<Cas3ExternalPreviousBookingDto>;
    uiUrl: string;
};

