/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LostBedCancellation } from './LostBedCancellation';
import type { LostBedReason } from './LostBedReason';
export type LostBed = {
    id: string;
    startDate: string;
    endDate: string;
    bedId: string;
    bedName: string;
    roomName: string;
    reason: LostBedReason;
    status: 'active' | 'cancelled';
    referenceNumber?: string;
    notes?: string;
    cancellation?: LostBedCancellation;
};

