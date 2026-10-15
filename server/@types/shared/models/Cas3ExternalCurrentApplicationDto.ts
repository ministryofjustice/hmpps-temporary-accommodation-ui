/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApplicationStatus } from './ApplicationStatus';
import type { Cas3BookingStatus } from './Cas3BookingStatus';
import type { Cas3ExternalLatestBookingPremisesDto } from './Cas3ExternalLatestBookingPremisesDto';
import type { Cas3ExternalPreviousBookingDto } from './Cas3ExternalPreviousBookingDto';
import type { Cas3ExternalSubmittedApplicationDto } from './Cas3ExternalSubmittedApplicationDto';
import type { Cas3StaffDto } from './Cas3StaffDto';
import type { TemporaryAccommodationAssessmentStatus } from './TemporaryAccommodationAssessmentStatus';
export type Cas3ExternalCurrentApplicationDto = {
    /**
     * @deprecated
     */
    applicationRejectedReason?: string;
    applicationStatus: ApplicationStatus;
    /**
     * @deprecated
     */
    applicationSubmittedBy: Cas3StaffDto;
    /**
     * @deprecated
     */
    applicationSubmittedDate?: string;
    /**
     * @deprecated
     */
    assessmentStatus?: TemporaryAccommodationAssessmentStatus;
    /**
     * @deprecated
     */
    bookingProvisionalOfferSentDate?: string;
    /**
     * @deprecated
     */
    bookingStatus?: Cas3BookingStatus;
    id: string;
    /**
     * This is the most recent booking for the application, could arguably be named 'latestBooking' or 'mostRecentBooking' but 'premises' is the name used in SAS.
     * @deprecated
     */
    premises?: Cas3ExternalLatestBookingPremisesDto;
    /**
     * @deprecated
     */
    previousBookings?: Array<Cas3ExternalPreviousBookingDto>;
    /**
     * A submitted application will be defined when the applicationStatus has any value other than 'inProgress'
     */
    submittedApplication?: Cas3ExternalSubmittedApplicationDto;
    uiUrl: string;
};

