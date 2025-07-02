/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas3BedspaceCharacteristic } from './Cas3BedspaceCharacteristic';
import type { Cas3BedspaceStatus } from './Cas3BedspaceStatus';
import type { Characteristic } from './Characteristic';
export type Cas3Bedspace = {
    bedspaceCharacteristics?: Array<Cas3BedspaceCharacteristic>;
    characteristics?: Array<Characteristic>;
    /**
     * End date of the bedspace availability
     */
    endDate?: string;
    id: string;
    notes?: string;
    reference: string;
    /**
     * Start date of the bedspace availability
     */
    startDate: string;
    status: Cas3BedspaceStatus;
};

