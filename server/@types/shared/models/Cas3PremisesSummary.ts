/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas3BedspaceSummary } from './Cas3BedspaceSummary';
import type { PropertyStatus } from './PropertyStatus';
export type Cas3PremisesSummary = {
    id: string;
    name: string;
    addressLine1: string;
    addressLine2?: string;
    postcode: string;
    pdu: string;
    localAuthorityAreaName?: string;
    bedspaces?: Array<Cas3BedspaceSummary>;
    bedspaceCount: number;
    status: PropertyStatus;
};

