/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProbationDeliveryUnit } from './ProbationDeliveryUnit';
import type { ProbationRegion } from './ProbationRegion';
export type User = {
    name: string;
    id: string;
    isActive?: boolean;
    region: ProbationRegion;
    service: string;
    email?: string;
    telephoneNumber?: string;
    deliusUsername: string;
    probationDeliveryUnit?: ProbationDeliveryUnit;
};

