/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import { ProbationRegion } from './ProbationRegion';
import type { UserQualification } from './UserQualification';
import type { UserRole } from './UserRole';

export type User = {
    name: string;
    deliusUsername: string;
    email: string;
    telephoneNumber?: string;
    roles: Array<UserRole>;
    qualifications: Array<UserQualification>;
    probationRegion: ProbationRegion;
};

