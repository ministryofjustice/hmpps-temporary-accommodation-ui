/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FullPerson } from './FullPerson';
import type { PersonRisks } from './PersonRisks';
import type { RestrictedPerson } from './RestrictedPerson';
import type { UnknownPerson } from './UnknownPerson';
export type AssessmentSummary = {
    id: string;
    type: string;
    decision?: 'accepted' | 'rejected';
    person: (FullPerson | RestrictedPerson | UnknownPerson);
    risks?: PersonRisks;
    createdAt: string;
    arrivalDate?: string;
    applicationId: string;
    dateOfInfoRequest?: string;
};

