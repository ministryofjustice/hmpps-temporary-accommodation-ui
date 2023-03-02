/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ServiceName } from './ServiceName';

export type UpdateLostBed = {
    startDate: string;
    endDate: string;
    reason: string;
    referenceNumber?: string;
    notes?: string;
    serviceName: ServiceName;
};

