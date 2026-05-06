/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AssessmentDecision } from './AssessmentDecision';
import type { FullPerson } from './FullPerson';
import type { PersonRisks } from './PersonRisks';
import type { RestrictedPerson } from './RestrictedPerson';
import type { TemporaryAccommodationAssessmentStatus } from './TemporaryAccommodationAssessmentStatus';
import type { UnknownPerson } from './UnknownPerson';
export type Cas3AssessmentSummary = {
    applicationId: string;
    arrivalDate?: string | null;
    createdAt: string;
    dateOfInfoRequest?: string | null;
    decision?: (AssessmentDecision | null);
    id: string;
    person: (FullPerson | RestrictedPerson | UnknownPerson);
    probationDeliveryUnitName?: string | null;
    risks?: (PersonRisks | null);
    status: TemporaryAccommodationAssessmentStatus;
};

