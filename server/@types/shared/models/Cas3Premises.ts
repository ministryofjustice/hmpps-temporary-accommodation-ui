/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas3PremisesArchiveAction } from './Cas3PremisesArchiveAction';
import type { Cas3PremisesStatus } from './Cas3PremisesStatus';
import type { Characteristic } from './Characteristic';
import type { LocalAuthorityArea } from './LocalAuthorityArea';
import type { ProbationDeliveryUnit } from './ProbationDeliveryUnit';
import type { ProbationRegion } from './ProbationRegion';
export type Cas3Premises = {
    addressLine1: string;
    addressLine2?: string;
    archiveHistory?: Array<Cas3PremisesArchiveAction>;
    characteristics?: Array<Characteristic>;
    endDate?: string;
    id: string;
    localAuthorityArea?: LocalAuthorityArea;
    notes?: string;
    postcode: string;
    probationDeliveryUnit: ProbationDeliveryUnit;
    probationRegion: ProbationRegion;
    reference: string;
    scheduleUnarchiveDate?: string;
    startDate: string;
    status: Cas3PremisesStatus;
    totalArchivedBedspaces: number;
    totalOnlineBedspaces: number;
    totalUpcomingBedspaces: number;
    town?: string;
    turnaroundWorkingDays?: number;
};

