/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Cas3UpdatePremises = {
    addressLine1: string;
    addressLine2?: string;
    characteristicIds: Array<string>;
    localAuthorityAreaId?: string;
    notes?: string;
    postcode: string;
    probationDeliveryUnitId: string;
    probationRegionId: string;
    reference: string;
    town?: string;
    /**
     * Will be replaced with turnaroundWorkingDays for v2
     * @deprecated
     */
    turnaroundWorkingDayCount?: number;
    turnaroundWorkingDays?: number;
};

