/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Person } from './Person';
import type { PersonRisks } from './PersonRisks';
import type { PlacementRequirements } from './PlacementRequirements';

export type PlacementRequest = (PlacementRequirements & {
    id?: string;
    person?: Person;
    risks?: PersonRisks;
    applicationId?: string;
    assessmentId?: string;
} & {
    id: string;
    person: Person;
    risks: PersonRisks;
    applicationId: string;
    assessmentId: string;
});

