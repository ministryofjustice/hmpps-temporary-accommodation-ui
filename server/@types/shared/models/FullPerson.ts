/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Person } from './Person';
import type { PersonStatus } from './PersonStatus';
export type FullPerson = (Person & {
    dateOfBirth?: string;
    ethnicity?: string | null;
    genderIdentity?: string | null;
    isRestricted?: boolean | null;
    name?: string;
    nationality?: string | null;
    nomsNumber?: string | null;
    pncNumber?: string | null;
    prisonName?: string | null;
    religionOrBelief?: string | null;
    sex?: string;
    status?: PersonStatus;
} & {
    dateOfBirth: string;
    name: string;
    sex: string;
    status: PersonStatus;
});

