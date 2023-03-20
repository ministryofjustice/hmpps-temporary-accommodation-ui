/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { BedSearchParameters } from './BedSearchParameters';

export type TemporaryAccommodationBedSearchParameters = (BedSearchParameters & {
    /**
     * The pdu to search within
     */
    probation_delivery_unit?: string;
} & {
    /**
     * The pdu to search within
     */
    probation_delivery_unit: string;
});

