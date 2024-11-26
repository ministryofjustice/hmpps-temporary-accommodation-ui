/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BedSearchResultBedSummary } from './BedSearchResultBedSummary';
import type { BedSearchResultPremisesSummary } from './BedSearchResultPremisesSummary';
import type { BedSearchResultRoomSummary } from './BedSearchResultRoomSummary';
export type BedSearchResult = {
    bed: BedSearchResultBedSummary;
    serviceName: 'approved-premises' | 'cas2' | 'temporary-accommodation';
    room: BedSearchResultRoomSummary;
    premises: BedSearchResultPremisesSummary;
};

