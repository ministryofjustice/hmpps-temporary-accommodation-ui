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
import type { Cas3Overstay } from './Cas3Overstay';
import type { Cas3Turnaround } from './Cas3Turnaround';
import type { FullPerson } from './FullPerson';
import type { RestrictedPerson } from './RestrictedPerson';
import type { UnknownPerson } from './UnknownPerson';
export type Cas3Booking = {
    applicationId?: string | null;
    arrival?: (Cas3Arrival | null);
    arrivalDate: string;
    assessmentId?: string | null;
    bedspace: Cas3BedspaceSummary;
    cancellation?: (Cas3Cancellation | null);
    /**
     * The full history of the cancellation
     */
    cancellations: Array<Cas3Cancellation>;
    confirmation?: (Cas3Confirmation | null);
    createdAt: string;
    departure?: (Cas3Departure | null);
    departureDate: string;
    /**
     * The full history of the departure
     */
    departures: Array<Cas3Departure>;
    effectiveEndDate?: string | null;
    extensions: Array<Cas3Extension>;
    id: string;
    nonArrival?: (Cas3NonArrival | null);
    originalArrivalDate: string;
    originalDepartureDate: string;
    overstays: Array<Cas3Overstay>;
    person: (FullPerson | RestrictedPerson | UnknownPerson);
    premises: Cas3BookingPremisesSummary;
    status: Cas3BookingStatus;
    turnaround?: (Cas3Turnaround | null);
    turnaroundStartDate?: string | null;
    /**
     * The full history of turnarounds
     */
    turnarounds?: any[] | null;
};

