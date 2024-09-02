/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BedSearchParameters } from './BedSearchParameters';
export type TemporaryAccommodationBedSearchParameters = (BedSearchParameters & {
    /**
     * The pdu to search within
     */
    probationDeliveryUnit: string;
    /**
     * Is a shared property
     */
    sharedProperty?: boolean;
    /**
     * Is the property for single occupancy
     */
    singleOccupancy?: boolean;
});

