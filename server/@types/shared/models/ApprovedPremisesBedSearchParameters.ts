/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { BedSearchParameters } from './BedSearchParameters';

export type ApprovedPremisesBedSearchParameters = (BedSearchParameters & {
    /**
     * The postcode district to search outwards from
     */
    postcodeDistrict: string;
    /**
     * Maximum number of miles from the postcode district to search, only required if more than 50 miles which is the default
     */
    maxDistanceMiles: number;
    requiredPremisesCharacteristics: Array<string>;
    requiredBedCharacteristics: Array<string>;
});

