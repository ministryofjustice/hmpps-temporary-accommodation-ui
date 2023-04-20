/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { PropertyStatus } from './PropertyStatus';

export type UpdatePremises = {
    addressLine1: string;
    addressLine2?: string;
    town?: string;
    postcode: string;
    notes?: string;
    localAuthorityAreaId?: string;
    probationRegionId: string;
    characteristicIds: Array<string>;
    status: PropertyStatus;
    pdu?: string;
    probationDeliveryUnitId?: string;
};

