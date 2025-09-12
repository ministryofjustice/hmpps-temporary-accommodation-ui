/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas3BedspaceArchiveAction } from './Cas3BedspaceArchiveAction';
import type { Cas3BedspaceCharacteristic } from './Cas3BedspaceCharacteristic';
import type { Cas3BedspaceStatus } from './Cas3BedspaceStatus';
import type { Characteristic } from './Characteristic';
export type Cas3Bedspace = {
    archiveHistory: Array<Cas3BedspaceArchiveAction>;
    bedspaceCharacteristics?: Array<Cas3BedspaceCharacteristic>;
    characteristics?: Array<Characteristic>;
    endDate?: string;
    id: string;
    notes?: string;
    reference: string;
    scheduleUnarchiveDate?: string;
    startDate?: string;
    status: Cas3BedspaceStatus;
};

