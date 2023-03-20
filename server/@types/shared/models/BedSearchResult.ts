/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { BedSearchResultBedSummary } from './BedSearchResultBedSummary';
import type { BedSearchResultPremisesSummary } from './BedSearchResultPremisesSummary';
import type { BedSearchResultRoomSummary } from './BedSearchResultRoomSummary';

export type BedSearchResult = {
    service?: string;
    premises: BedSearchResultPremisesSummary;
    room: BedSearchResultRoomSummary;
    bed: BedSearchResultBedSummary;
};

