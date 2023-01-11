/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { UserQualification } from './UserQualification';
import type { UserRole } from './UserRole';

export type User = {
    deliusUsername: string;
    email: string;
    telephoneNumber?: string;
    roles: Array<UserRole>;
    qualifications: Array<UserQualification>;
};

