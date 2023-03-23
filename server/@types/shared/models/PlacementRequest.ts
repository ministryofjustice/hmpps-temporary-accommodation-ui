/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { NewPlacementRequest } from './NewPlacementRequest';
import type { Person } from './Person';
import type { PersonRisks } from './PersonRisks';

export type PlacementRequest = (NewPlacementRequest & {
    id?: string;
    person?: Person;
    risks?: PersonRisks;
} & {
    id: string;
    person: Person;
    risks: PersonRisks;
});

