/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApprovedPremisesUser } from './ApprovedPremisesUser';
import type { TemporaryAccommodationUser } from './TemporaryAccommodationUser';
export type ProfileResponse = {
    deliusUsername: string;
    loadError?: 'staff_record_not_found';
    user?: (ApprovedPremisesUser | TemporaryAccommodationUser);
};

