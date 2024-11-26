/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Person } from './Person';
export type FullPerson = (Person & {
    name?: string;
    dateOfBirth?: string;
    sex?: string;
    status?: 'InCustody' | 'InCommunity' | 'Unknown';
    nomsNumber?: string;
    pncNumber?: string;
    ethnicity?: string;
    nationality?: string;
    religionOrBelief?: string;
    genderIdentity?: string;
    prisonName?: string;
    isRestricted?: boolean;
} & {
    name: string;
    dateOfBirth: string;
    sex: string;
    status: 'InCustody' | 'InCommunity' | 'Unknown';
});

