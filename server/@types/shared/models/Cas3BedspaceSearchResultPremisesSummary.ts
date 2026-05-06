/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas3CharacteristicPair } from './Cas3CharacteristicPair';
export type Cas3BedspaceSearchResultPremisesSummary = {
    addressLine1: string;
    addressLine2?: string | null;
    bedspaceCount: number;
    bookedBedspaceCount?: number | null;
    characteristics: Array<Cas3CharacteristicPair>;
    id: string;
    name: string;
    notes?: string | null;
    postcode: string;
    probationDeliveryUnitName?: string | null;
    town?: string | null;
};

