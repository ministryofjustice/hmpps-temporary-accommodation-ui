/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PropertyStatus } from './PropertyStatus';
/**
 * Information to update the premises with
 */
export type UpdatePremises = {
    addressLine1: string;
    addressLine2?: string | null;
    characteristicIds: Array<string>;
    localAuthorityAreaId?: string | null;
    name?: string | null;
    notes?: string | null;
    pdu?: string | null;
    postcode: string;
    probationDeliveryUnitId?: string | null;
    probationRegionId: string;
    status: PropertyStatus;
    town?: string | null;
    turnaroundWorkingDayCount?: number | null;
};

