/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Arrival } from './Arrival';
import type { Bed } from './Bed';
import type { BookingPremisesSummary } from './BookingPremisesSummary';
import type { BookingStatus } from './BookingStatus';
import type { Cancellation } from './Cancellation';
import type { Confirmation } from './Confirmation';
import type { Departure } from './Departure';
import type { Extension } from './Extension';
import type { FullPerson } from './FullPerson';
import type { Nonarrival } from './Nonarrival';
import type { RestrictedPerson } from './RestrictedPerson';
import type { ServiceName } from './ServiceName';
import type { Turnaround } from './Turnaround';
import type { UnknownPerson } from './UnknownPerson';
export type Booking = {
    applicationId?: string | null;
    arrival?: (Arrival | null);
    arrivalDate: string;
    assessmentId?: string | null;
    bed?: (Bed | null);
    cancellation?: (Cancellation | null);
    /**
     * The full history of the cancellation
     */
    cancellations: Array<Cancellation>;
    confirmation?: (Confirmation | null);
    createdAt: string;
    departure?: (Departure | null);
    departureDate: string;
    /**
     * The full history of the departure
     */
    departures: Array<Departure>;
    effectiveEndDate?: string | null;
    extensions: Array<Extension>;
    id: string;
    nonArrival?: (Nonarrival | null);
    originalArrivalDate: string;
    originalDepartureDate: string;
    person: (FullPerson | RestrictedPerson | UnknownPerson);
    premises: BookingPremisesSummary;
    serviceName: ServiceName;
    status: BookingStatus;
    turnaround?: (Turnaround | null);
    turnaroundStartDate?: string | null;
    /**
     * The full history of turnarounds
     */
    turnarounds?: any[] | null;
};

