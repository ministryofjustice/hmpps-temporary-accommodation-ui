/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas3PremisesStatus } from './Cas3PremisesStatus';
import type { Characteristic } from './Characteristic';
import type { LocalAuthorityArea } from './LocalAuthorityArea';
import type { ProbationDeliveryUnit } from './ProbationDeliveryUnit';
import type { ProbationRegion } from './ProbationRegion';
export type Cas3Premises = {
    id: string;
    reference: string;
    addressLine1: string;
    addressLine2?: string;
    town?: string;
    postcode: string;
    localAuthorityArea?: LocalAuthorityArea;
    probationRegion: ProbationRegion;
    probationDeliveryUnit: ProbationDeliveryUnit;
    characteristics?: Array<Characteristic>;
    /**
     * Start date of the property.
     */
    startDate?: string;
    status: Cas3PremisesStatus;
    notes?: string;
    turnaroundWorkingDayCount?: number;
    totalOnlineBedspaces: number;
    totalUpcomingBedspaces: number;
    totalArchivedBedspaces: number;
};

