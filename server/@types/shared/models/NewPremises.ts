/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { PropertyStatus } from './PropertyStatus';

export type NewPremises = {
    name: string;
    addressLine1: string;
    postcode: string;
    notes?: string;
    localAuthorityAreaId: string;
    probationRegionId: string;
    characteristicIds: Array<string>;
    status: PropertyStatus;
    pdu?: string;
};

