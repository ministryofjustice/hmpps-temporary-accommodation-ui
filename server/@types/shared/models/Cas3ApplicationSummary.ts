/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApplicationStatus } from './ApplicationStatus';
import type { Person } from './Person';
import type { PersonRisks } from './PersonRisks';
export type Cas3ApplicationSummary = {
    id: string;
    person: Person;
    createdAt: string;
    submittedAt?: string;
    createdByUserId: string;
    status: ApplicationStatus;
    risks?: PersonRisks;
};

