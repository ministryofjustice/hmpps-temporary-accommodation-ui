/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LocalAuthorityArea } from './LocalAuthorityArea';
import type { Premises } from './Premises';
import type { ProbationDeliveryUnit } from './ProbationDeliveryUnit';
export type TemporaryAccommodationPremises = (Premises & {
    addressLine2?: string | null;
    characteristics?: any[] | null;
    localAuthorityArea?: (LocalAuthorityArea | null);
    notes?: string | null;
    pdu?: string;
    probationDeliveryUnit?: (ProbationDeliveryUnit | null);
    town?: string | null;
    turnaroundWorkingDayCount?: number | null;
} & {
    pdu: string;
});

