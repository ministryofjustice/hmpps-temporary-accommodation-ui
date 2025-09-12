/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas3Arrival } from './Cas3Arrival';
import type { Cas3BedspaceSummary } from './Cas3BedspaceSummary';
import type { Cas3BookingPremisesSummary } from './Cas3BookingPremisesSummary';
import type { Cas3BookingStatus } from './Cas3BookingStatus';
import type { Cas3Cancellation } from './Cas3Cancellation';
import type { Cas3Confirmation } from './Cas3Confirmation';
import type { Cas3Departure } from './Cas3Departure';
import type { Cas3Extension } from './Cas3Extension';
import type { Cas3NonArrival } from './Cas3NonArrival';
import type { Cas3Turnaround } from './Cas3Turnaround';
import type { FullPerson } from './FullPerson';
import type { RestrictedPerson } from './RestrictedPerson';
import type { UnknownPerson } from './UnknownPerson';
export type Cas3Booking = {
    applicationId?: string;
    arrival?: Cas3Arrival;
    arrivalDate: string;
    assessmentId?: string;
    bedspace: Cas3BedspaceSummary;
    /**
     * The latest version of the cancellation, if it exists
     */
    cancellation?: Cas3Cancellation;
    /**
     * The full history of the cancellation
     */
    cancellations: Array<Cas3Cancellation>;
    confirmation?: Cas3Confirmation;
    createdAt: string;
    /**
     * The latest version of the departure, if it exists
     */
    departure?: Cas3Departure;
    departureDate: string;
    /**
     * The full history of the departure
     */
    departures: Array<Cas3Departure>;
    effectiveEndDate?: string;
    extensions: Array<Cas3Extension>;
    id: string;
    nonArrival?: Cas3NonArrival;
    originalArrivalDate: string;
    originalDepartureDate: string;
    person: (FullPerson | RestrictedPerson | UnknownPerson);
    premises: Cas3BookingPremisesSummary;
    status: Cas3BookingStatus;
    /**
     * The latest version of the turnaround, if it exists
     */
    turnaround?: Cas3Turnaround;
    turnaroundStartDate?: string;
    /**
     * The full history of turnarounds
     */
    turnarounds?: Array<Cas3Turnaround>;
};

