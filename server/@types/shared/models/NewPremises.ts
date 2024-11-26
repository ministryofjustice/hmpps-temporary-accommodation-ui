/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type NewPremises = {
    name: string;
    addressLine1: string;
    postcode: string;
    probationRegionId: string;
    characteristicIds: Array<string>;
    status: 'pending' | 'active' | 'archived';
    addressLine2?: string;
    town?: string;
    notes?: string;
    localAuthorityAreaId?: string;
    pdu?: string;
    probationDeliveryUnitId?: string;
    turnaroundWorkingDayCount?: number;
};

