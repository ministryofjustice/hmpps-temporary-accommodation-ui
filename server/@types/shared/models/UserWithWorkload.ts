/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApArea } from './ApArea';
import type { ApprovedPremisesUserRole } from './ApprovedPremisesUserRole';
import type { User } from './User';
import type { UserQualification } from './UserQualification';
export type UserWithWorkload = (User & {
    numTasksPending?: number;
    numTasksCompleted7Days?: number;
    numTasksCompleted30Days?: number;
    qualifications?: Array<UserQualification>;
    roles?: Array<ApprovedPremisesUserRole>;
    apArea?: ApArea;
});

