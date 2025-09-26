/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas3CostCentre } from './Cas3CostCentre';
import type { LostBedCancellation } from './LostBedCancellation';
import type { LostBedReason } from './LostBedReason';
import type { LostBedStatus } from './LostBedStatus';
export type LostBed = {
    bedId: string;
    bedName: string;
    cancellation?: LostBedCancellation;
    costCentre?: Cas3CostCentre;
    endDate: string;
    id: string;
    notes?: string;
    reason: LostBedReason;
    referenceNumber?: string;
    roomName: string;
    startDate: string;
    status: LostBedStatus;
};

