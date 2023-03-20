/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { BedSearchResult } from './BedSearchResult';

export type ApprovedPremisesBedSearchResult = (BedSearchResult & {
    /**
     * how many miles away from the postcode district the Premises this Bed belongs to is
     */
    distance_miles?: number;
} & {
    /**
     * how many miles away from the postcode district the Premises this Bed belongs to is
     */
    distance_miles: number;
});

