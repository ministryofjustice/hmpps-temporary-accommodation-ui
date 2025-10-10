/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas3BedspaceSearchResultBedspaceSummary } from './Cas3BedspaceSearchResultBedspaceSummary';
import type { Cas3BedspaceSearchResultPremisesSummary } from './Cas3BedspaceSearchResultPremisesSummary';
import type { Cas3v2BedspaceSearchResultOverlap } from './Cas3v2BedspaceSearchResultOverlap';
export type Cas3v2BedspaceSearchResult = {
    bedspace: Cas3BedspaceSearchResultBedspaceSummary;
    overlaps: Array<Cas3v2BedspaceSearchResultOverlap>;
    premises: Cas3BedspaceSearchResultPremisesSummary;
};

