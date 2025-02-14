/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Bed } from './Bed';
import type { Person } from './Person';
export type FutureBooking = {
    id: string;
    person: Person;
    arrivalDate: string;
    departureDate: string;
    bed?: Bed;
};

