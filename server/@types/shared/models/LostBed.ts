/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { LostBedReason } from './LostBedReason';

export type LostBed = {
    id: string;
    startDate: string;
    endDate: string;
    reason: LostBedReason;
    referenceNumber?: string;
    notes?: string;
};

