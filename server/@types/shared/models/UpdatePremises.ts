/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { PropertyStatus } from './PropertyStatus';

export type UpdatePremises = {
    addressLine1: string;
    postcode: string;
    notes?: string;
    localAuthorityAreaId: string;
    characteristicIds: Array<string>;
    status: PropertyStatus;
};

