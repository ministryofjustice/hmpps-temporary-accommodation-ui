/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { LostBedCancellation } from './LostBedCancellation';
import type { LostBedReason } from './LostBedReason';
import type { LostBedStatus } from './LostBedStatus';

export type LostBed = {
    id: string;
    startDate: string;
    endDate: string;
    reason: LostBedReason;
    referenceNumber?: string;
    notes?: string;
    status: LostBedStatus;
    cancellation?: LostBedCancellation | null;
};

