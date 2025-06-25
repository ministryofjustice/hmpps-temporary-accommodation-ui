/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas3Arrival } from './Cas3Arrival';
import type { Cas3BookingBody } from './Cas3BookingBody';
import type { Cas3BookingPremisesSummary } from './Cas3BookingPremisesSummary';
import type { Cas3BookingStatus } from './Cas3BookingStatus';
import type { Cas3Cancellation } from './Cas3Cancellation';
import type { Cas3Confirmation } from './Cas3Confirmation';
import type { Cas3Departure } from './Cas3Departure';
import type { Cas3Extension } from './Cas3Extension';
import type { Cas3NonArrival } from './Cas3NonArrival';
import type { Cas3Turnaround } from './Cas3Turnaround';
export type Cas3Booking = (Cas3BookingBody & {
    status: Cas3BookingStatus;
    extensions: Array<Cas3Extension>;
    arrival?: Cas3Arrival | null;
    /**
     * The latest version of the departure, if it exists
     */
    departure?: Cas3Departure | null;
    /**
     * The full history of the departure
     */
    departures: Array<Cas3Departure>;
    nonArrival?: Cas3NonArrival | null;
    /**
     * The latest version of the cancellation, if it exists
     */
    cancellation?: Cas3Cancellation | null;
    /**
     * The full history of the cancellation
     */
    cancellations: Array<Cas3Cancellation>;
    confirmation?: Cas3Confirmation | null;
    /**
     * The latest version of the turnaround, if it exists
     */
    turnaround?: Cas3Turnaround | null;
    /**
     * The full history of turnarounds
     */
    turnarounds?: Array<Cas3Turnaround>;
    turnaroundStartDate?: string;
    effectiveEndDate?: string;
    applicationId?: string;
    assessmentId?: string;
    premises: Cas3BookingPremisesSummary;
});

