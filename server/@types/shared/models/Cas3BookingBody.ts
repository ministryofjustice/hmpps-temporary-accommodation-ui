/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas3Bedspace } from './Cas3Bedspace';
import type { Person } from './Person';
export type Cas3BookingBody = {
    id: string;
    person: Person;
    arrivalDate: string;
    originalArrivalDate: string;
    departureDate: string;
    originalDepartureDate: string;
    createdAt: string;
    bedspace: Cas3Bedspace;
};

