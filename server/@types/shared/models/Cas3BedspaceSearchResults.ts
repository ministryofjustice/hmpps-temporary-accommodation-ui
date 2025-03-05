/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas3BedspaceSearchResult } from './Cas3BedspaceSearchResult';
export type Cas3BedspaceSearchResults = {
    /**
     * How many distinct Rooms the Beds in the results belong to
     */
    resultsRoomCount: number;
    /**
     * How many distinct Premises the Beds in the results belong to
     */
    resultsPremisesCount: number;
    /**
     * How many Beds are in the results
     */
    resultsBedCount: number;
    results: Array<Cas3BedspaceSearchResult>;
};

