/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas1OutOfServiceBedCancellation } from './Cas1OutOfServiceBedCancellation';
import type { Cas1OutOfServiceBedReason } from './Cas1OutOfServiceBedReason';
import type { Cas1OutOfServiceBedRevision } from './Cas1OutOfServiceBedRevision';
import type { NamedId } from './NamedId';
export type Cas1OutOfServiceBed = {
    id: string;
    createdAt: string;
    startDate: string;
    endDate: string;
    bed: NamedId;
    room: NamedId;
    premises: NamedId;
    apArea: NamedId;
    reason: Cas1OutOfServiceBedReason;
    daysLostCount: number;
    temporality: 'past' | 'current' | 'future';
    status: 'active' | 'cancelled';
    revisionHistory: Array<Cas1OutOfServiceBedRevision>;
    referenceNumber?: string;
    notes?: string;
    cancellation?: Cas1OutOfServiceBedCancellation;
};

