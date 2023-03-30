/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { BookingSearchStatus } from './BookingSearchStatus';

export type BookingSearchResultBookingSummary = {
    id: string;
    status: BookingSearchStatus;
    startDate: string;
    endDate: string;
    createdAt: string;
};

