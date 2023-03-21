/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { NewPlacementRequest } from './NewPlacementRequest';
import type { Person } from './Person';
import type { PersonRisks } from './PersonRisks';

export type PlacementRequest = (NewPlacementRequest & {
    person?: Person;
    risks?: PersonRisks;
} & {
    person: Person;
    risks: PersonRisks;
});

