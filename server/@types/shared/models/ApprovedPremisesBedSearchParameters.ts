/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { BedSearchParameters } from './BedSearchParameters';

export type ApprovedPremisesBedSearchParameters = (BedSearchParameters & {
    /**
     * The postcode district to search outwards from
     */
    postcode_district?: string;
    /**
     * Maximum number of miles from the postcode district to search, only required if more than 50 miles which is the default
     */
    max_distance_miles?: number;
    required_premises_characteristics?: Array<string>;
    required_bed_characteristics?: Array<string>;
} & {
    /**
     * The postcode district to search outwards from
     */
    postcode_district: string;
    /**
     * Maximum number of miles from the postcode district to search, only required if more than 50 miles which is the default
     */
    max_distance_miles: number;
    required_premises_characteristics: Array<string>;
    required_bed_characteristics: Array<string>;
});

