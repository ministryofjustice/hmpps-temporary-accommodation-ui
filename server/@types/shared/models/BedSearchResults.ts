/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { BedSearchResult } from './BedSearchResult';

export type BedSearchResults = {
    /**
     * How many distinct Rooms the Beds in the results belong to
     */
    results_room_count?: number;
    /**
     * How many distinct Premises the Beds in the results belong to
     */
    results_premises_count?: number;
    /**
     * How many Beds are in the results
     */
    results_bed_count?: number;
    results?: Array<BedSearchResult>;
};

