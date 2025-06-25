/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas3BedspaceCharacteristic } from './Cas3BedspaceCharacteristic';
import type { Cas3BedspaceStatus } from './Cas3BedspaceStatus';
import type { Characteristic } from './Characteristic';
export type Cas3Bedspace = {
    id: string;
    reference: string;
    /**
     * Start date of the bedspace availability
     */
    startDate?: string;
    /**
     * End date of the bedspace availability
     */
    endDate?: string;
    status: Cas3BedspaceStatus;
    notes?: string;
    characteristics?: Array<Characteristic>;
    bedspaceCharacteristics?: Array<Cas3BedspaceCharacteristic>;
};

