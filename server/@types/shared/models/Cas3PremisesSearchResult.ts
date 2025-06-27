/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas3BedspacePremisesSearchResult } from './Cas3BedspacePremisesSearchResult';
export type Cas3PremisesSearchResult = {
    addressLine1: string;
    addressLine2?: string;
    bedspaces?: Array<Cas3BedspacePremisesSearchResult>;
    id: string;
    localAuthorityAreaName?: string;
    pdu: string;
    postcode: string;
    reference: string;
    totalArchivedBedspaces?: number;
    town?: string;
};

