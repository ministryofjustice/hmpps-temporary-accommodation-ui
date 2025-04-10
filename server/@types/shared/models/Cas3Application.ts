/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApplicationStatus } from './ApplicationStatus';
import type { Person } from './Person';
import type { PersonRisks } from './PersonRisks';
import type { Unit } from './Unit';
export type Cas3Application = {
    id: string;
    person: Person;
    createdAt: string;
    createdByUserId: string;
    schemaVersion: string;
    outdatedSchema: boolean;
    data?: Unit;
    document?: Unit;
    status: ApplicationStatus;
    risks?: PersonRisks;
    submittedAt?: string;
    arrivalDate?: string;
    offenceId: string;
    assessmentId?: string;
};

