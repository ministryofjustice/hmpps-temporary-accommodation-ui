/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
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
    notes?: string;
    characteristics: Array<Characteristic>;
};

