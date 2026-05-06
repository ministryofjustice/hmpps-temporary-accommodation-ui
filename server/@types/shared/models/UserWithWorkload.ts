/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApArea } from './ApArea';
import type { NamedId } from './NamedId';
import type { ProbationDeliveryUnit } from './ProbationDeliveryUnit';
import type { ProbationRegion } from './ProbationRegion';
export type UserWithWorkload = {
    apArea?: (ApArea | null);
    cruManagementArea?: (NamedId | null);
    deliusUsername: string;
    email?: string | null;
    id: string;
    isActive?: boolean | null;
    name: string;
    numTasksCompleted30Days?: number | null;
    numTasksCompleted7Days?: number | null;
    numTasksPending?: number | null;
    probationDeliveryUnit?: (ProbationDeliveryUnit | null);
    qualifications?: any[] | null;
    region: ProbationRegion;
    service: string;
    telephoneNumber?: string | null;
};

