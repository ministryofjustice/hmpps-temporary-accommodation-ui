/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CharacteristicPair } from './CharacteristicPair';
export type BedSearchResultPremisesSummary = {
    addressLine1: string;
    addressLine2?: string;
    /**
     * the total number of Beds in the Premises
     */
    bedCount: number;
    /**
     * the total number of booked Beds in the Premises
     */
    bookedBedCount?: number;
    characteristics: Array<CharacteristicPair>;
    id: string;
    name: string;
    notes?: string;
    postcode: string;
    probationDeliveryUnitName?: string;
    town?: string;
};

