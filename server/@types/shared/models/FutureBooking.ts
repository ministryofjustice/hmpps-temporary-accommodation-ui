/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Bed } from './Bed';
import type { FullPerson } from './FullPerson';
import type { RestrictedPerson } from './RestrictedPerson';
import type { UnknownPerson } from './UnknownPerson';
export type FutureBooking = {
    arrivalDate: string;
    bed?: Bed;
    departureDate: string;
    id: string;
    person: (FullPerson | RestrictedPerson | UnknownPerson);
};

