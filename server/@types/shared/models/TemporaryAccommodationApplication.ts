/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApplicationStatus } from './ApplicationStatus';
import type { FullPerson } from './FullPerson';
import type { PersonRisks } from './PersonRisks';
import type { RestrictedPerson } from './RestrictedPerson';
import type { UnknownPerson } from './UnknownPerson';
export type TemporaryAccommodationApplication = {
    arrivalDate?: string | null;
    assessmentId?: string | null;
    createdAt: string;
    createdByUserId: string;
    data?: null;
    document?: null;
    id: string;
    offenceId: string;
    person: (FullPerson | RestrictedPerson | UnknownPerson);
    risks?: (PersonRisks | null);
    status: ApplicationStatus;
    submittedAt?: string | null;
    type: string;
};

