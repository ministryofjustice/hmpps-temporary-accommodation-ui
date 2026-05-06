/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas3PremisesStatus } from './Cas3PremisesStatus';
export type Cas3PremisesBedspaceTotals = {
    id: string;
    premisesEndDate?: string | null;
    status: Cas3PremisesStatus;
    totalArchivedBedspaces: number;
    totalOnlineBedspaces: number;
    totalUpcomingBedspaces: number;
};

