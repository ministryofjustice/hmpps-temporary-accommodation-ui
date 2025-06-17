/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas3BedspacePremisesSearchResult } from './Cas3BedspacePremisesSearchResult';
export type Cas3PremisesSearchResult = {
    id: string;
    reference: string;
    addressLine1: string;
    addressLine2?: string;
    town?: string;
    postcode: string;
    pdu: string;
    localAuthorityAreaName?: string;
    bedspaces?: Array<Cas3BedspacePremisesSearchResult>;
    totalArchivedBedspaces?: number;
};

