/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas3BedspaceArchiveAction } from './Cas3BedspaceArchiveAction';
import type { Cas3BedspaceStatus } from './Cas3BedspaceStatus';
export type Cas3Bedspace = {
    archiveHistory: Array<Cas3BedspaceArchiveAction>;
    bedspaceCharacteristics?: any[] | null;
    characteristics?: any[] | null;
    endDate?: string | null;
    id: string;
    notes?: string | null;
    reference: string;
    scheduleUnarchiveDate?: string | null;
    startDate?: string | null;
    status: Cas3BedspaceStatus;
};

