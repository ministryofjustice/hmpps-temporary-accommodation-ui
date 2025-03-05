/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BedspaceFilters } from './BedspaceFilters';
import type { BedspaceSearchAttributes } from './BedspaceSearchAttributes';
import type { PremisesFilters } from './PremisesFilters';
export type Cas3BedspaceSearchParameters = {
    startDate: string;
    /**
     * The number of days the Bed will need to be free from the start_date until
     */
    durationDays: number;
    /**
     * The list of pdus Ids to search within
     */
    probationDeliveryUnits: Array<string>;
    premisesFilters?: PremisesFilters;
    bedspaceFilters?: BedspaceFilters;
    /**
     * Bedspace and property attributes to filter on
     */
    attributes?: Array<BedspaceSearchAttributes>;
};

