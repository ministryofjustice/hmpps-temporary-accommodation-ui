/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApArea } from './ApArea';
import type { LocalAuthorityArea } from './LocalAuthorityArea';
import type { ProbationRegion } from './ProbationRegion';
import type { PropertyStatus } from './PropertyStatus';
export type Premises = {
    addressLine1: string;
    addressLine2?: string | null;
    apArea: ApArea;
    availableBedsForToday: number;
    bedCount: number;
    characteristics?: any[] | null;
    id: string;
    localAuthorityArea?: (LocalAuthorityArea | null);
    name: string;
    notes?: string | null;
    postcode: string;
    probationRegion: ProbationRegion;
    service: string;
    status: PropertyStatus;
    town?: string | null;
};

