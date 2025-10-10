/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas3CharacteristicPair } from './Cas3CharacteristicPair';
export type Cas3BedspaceSearchResultPremisesSummary = {
    addressLine1: string;
    addressLine2?: string;
    bedspaceCount: number;
    bookedBedspaceCount?: number;
    characteristics: Array<Cas3CharacteristicPair>;
    id: string;
    name: string;
    notes?: string;
    postcode: string;
    probationDeliveryUnitName?: string;
    town?: string;
};

