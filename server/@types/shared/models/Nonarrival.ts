/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { NonArrivalReason } from './NonArrivalReason';

export type Nonarrival = {
    id: string;
    bookingId: string;
    date: string;
    reason: NonArrivalReason;
    notes?: string;
    createdAt: string;
};

