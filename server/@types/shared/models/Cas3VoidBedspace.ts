/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas3CostCentre } from './Cas3CostCentre';
import type { Cas3VoidBedspaceReason } from './Cas3VoidBedspaceReason';
import type { Cas3VoidBedspaceStatus } from './Cas3VoidBedspaceStatus';
export type Cas3VoidBedspace = {
    bedspaceId: string;
    bedspaceName: string;
    cancellationDate?: string | null;
    cancellationNotes?: string | null;
    costCentre?: (Cas3CostCentre | null);
    endDate: string;
    id: string;
    notes?: string | null;
    reason: Cas3VoidBedspaceReason;
    referenceNumber?: string | null;
    startDate: string;
    status: Cas3VoidBedspaceStatus;
};

