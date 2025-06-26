/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApplicationStatus } from './ApplicationStatus';
import type { FullPerson } from './FullPerson';
import type { PersonRisks } from './PersonRisks';
import type { RestrictedPerson } from './RestrictedPerson';
import type { UnknownPerson } from './UnknownPerson';
export type Cas3ApplicationSummary = {
    createdAt: string;
    createdByUserId: string;
    id: string;
    person: (FullPerson | RestrictedPerson | UnknownPerson);
    risks?: PersonRisks;
    status: ApplicationStatus;
    submittedAt?: string;
};

