/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BedspaceFilters } from './BedspaceFilters';
import type { PremisesFilters } from './PremisesFilters';
export type Cas3BedspaceSearchParameters = {
    bedspaceFilters?: BedspaceFilters;
    /**
     * The number of days the Bed will need to be free from the start_date until
     */
    durationDays: number;
    premisesFilters?: PremisesFilters;
    /**
     * The list of pdus Ids to search within
     */
    probationDeliveryUnits: Array<string>;
    startDate: string;
};

