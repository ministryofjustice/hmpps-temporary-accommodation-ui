/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LocalAuthorityArea } from './LocalAuthorityArea';
import type { Premises } from './Premises';
export type ApprovedPremises = (Premises & {
    addressLine2?: string | null;
    apCode?: string;
    characteristics?: any[] | null;
    notes?: string | null;
    town?: string | null;
} & {
    localAuthorityArea: (LocalAuthorityArea | null);
    apCode: string;
});

