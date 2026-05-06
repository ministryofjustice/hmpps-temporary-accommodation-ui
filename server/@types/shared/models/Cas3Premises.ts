/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas3PremisesStatus } from './Cas3PremisesStatus';
import type { LocalAuthorityArea } from './LocalAuthorityArea';
import type { ProbationDeliveryUnit } from './ProbationDeliveryUnit';
import type { ProbationRegion } from './ProbationRegion';
export type Cas3Premises = {
    addressLine1: string;
    addressLine2?: string | null;
    archiveHistory?: any[] | null;
    /**
     * Will be replaced with Cas3PremisesCharacteristics for v2
     * @deprecated
     */
    characteristics?: any[] | null;
    endDate?: string | null;
    id: string;
    localAuthorityArea?: (LocalAuthorityArea | null);
    notes?: string | null;
    postcode: string;
    premisesCharacteristics?: any[] | null;
    probationDeliveryUnit: ProbationDeliveryUnit;
    probationRegion: ProbationRegion;
    reference: string;
    scheduleUnarchiveDate?: string | null;
    startDate: string;
    status: Cas3PremisesStatus;
    totalArchivedBedspaces: number;
    totalOnlineBedspaces: number;
    totalUpcomingBedspaces: number;
    town?: string | null;
    turnaroundWorkingDays?: number | null;
};

