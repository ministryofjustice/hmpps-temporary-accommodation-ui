/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas3CostCentre } from './Cas3CostCentre';
/**
 * details of the lost bed
 */
export type NewLostBed = {
    bedId: string;
    costCentre?: Cas3CostCentre;
    endDate: string;
    notes?: string;
    reason: string;
    referenceNumber?: string;
    startDate: string;
};

