/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Person } from './Person';
import type { StaffMember } from './StaffMember';

export type BookingBody = {
    id: string;
    person: Person;
    arrivalDate: string;
    departureDate: string;
    keyWorker?: StaffMember;
};

