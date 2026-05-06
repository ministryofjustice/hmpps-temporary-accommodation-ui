/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProbationDeliveryUnit } from './ProbationDeliveryUnit';
import type { TemporaryAccommodationUserRole } from './TemporaryAccommodationUserRole';
import type { User } from './User';
export type TemporaryAccommodationUser = (User & {
    email?: string | null;
    isActive?: boolean | null;
    probationDeliveryUnit?: (ProbationDeliveryUnit | null);
    roles?: Array<TemporaryAccommodationUserRole>;
    telephoneNumber?: string | null;
} & {
    roles: Array<TemporaryAccommodationUserRole>;
});

