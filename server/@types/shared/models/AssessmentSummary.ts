/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AssessmentStatus } from './AssessmentStatus';
import type { Person } from './Person';
import type { PersonRisks } from './PersonRisks';

export type AssessmentSummary = {
    type: 'CAS1' | 'CAS3';
    id: string;
    applicationId: string;
    arrivalDate?: string;
    createdAt: string;
    dateOfInfoRequest?: string;
    status: AssessmentStatus;
    risks?: PersonRisks;
    person: Person;
};

