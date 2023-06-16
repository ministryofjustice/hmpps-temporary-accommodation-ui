/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { BedSearchResultBedSummary } from './BedSearchResultBedSummary';
import type { BedSearchResultPremisesSummary } from './BedSearchResultPremisesSummary';
import type { BedSearchResultRoomSummary } from './BedSearchResultRoomSummary';
import type { ServiceName } from './ServiceName';

export type BedSearchResult = {
    serviceName: ServiceName;
    premises: BedSearchResultPremisesSummary;
    room: BedSearchResultRoomSummary;
    bed: BedSearchResultBedSummary;
};

