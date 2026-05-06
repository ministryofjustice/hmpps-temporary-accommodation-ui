/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApArea } from './ApArea';
import type { ApprovedPremisesUserRole } from './ApprovedPremisesUserRole';
import type { NamedId } from './NamedId';
import type { ProbationDeliveryUnit } from './ProbationDeliveryUnit';
import type { User } from './User';
import type { UserQualification } from './UserQualification';
export type ApprovedPremisesUser = (User & {
    apArea?: ApArea;
    /**
     * CRU Management Area to use. This will be the same as cruManagementAreaDefault unless cruManagementAreaOverride is defined
     */
    cruManagementArea?: NamedId;
    /**
     * The CRU Management Area used if no override is defined. This is provided to support the user configuration page.
     */
    cruManagementAreaDefault?: NamedId;
    cruManagementAreaOverride?: (NamedId | null);
    email?: string | null;
    isActive?: boolean | null;
    permissions?: any[] | null;
    probationDeliveryUnit?: (ProbationDeliveryUnit | null);
    qualifications?: Array<UserQualification>;
    roles?: Array<ApprovedPremisesUserRole>;
    telephoneNumber?: string | null;
    version?: number | null;
} & {
    apArea: ApArea;
    /**
     * CRU Management Area to use. This will be the same as cruManagementAreaDefault unless cruManagementAreaOverride is defined
     */
    cruManagementArea: NamedId;
    /**
     * The CRU Management Area used if no override is defined. This is provided to support the user configuration page.
     */
    cruManagementAreaDefault: NamedId;
    qualifications: Array<UserQualification>;
    roles: Array<ApprovedPremisesUserRole>;
});

