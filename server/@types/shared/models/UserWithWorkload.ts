/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApArea } from './ApArea';
import type { NamedId } from './NamedId';
import type { ProbationDeliveryUnit } from './ProbationDeliveryUnit';
import type { ProbationRegion } from './ProbationRegion';
/**
 * Users to whom this task can be allocated
 */
export type UserWithWorkload = {
    service: string;
    id: string;
    name: string;
    deliusUsername: string;
    region: ProbationRegion;
    numTasksPending?: number;
    numTasksCompleted7Days?: number;
    numTasksCompleted30Days?: number;
    qualifications?: Array<'pipe' | 'lao' | 'emergency' | 'esap' | 'recovery_focused' | 'mental_health_specialist'>;
    roles?: Array<'assessor' | 'matcher' | 'manager' | 'legacy_manager' | 'future_manager' | 'workflow_manager' | 'cru_member' | 'cru_member_find_and_book_beta' | 'applicant' | 'role_admin' | 'report_viewer' | 'excluded_from_assess_allocation' | 'excluded_from_match_allocation' | 'excluded_from_placement_application_allocation' | 'appeals_manager' | 'janitor' | 'user_manager'>;
    apArea?: ApArea;
    cruManagementArea?: NamedId;
    email?: string;
    telephoneNumber?: string;
    isActive?: boolean;
    probationDeliveryUnit?: ProbationDeliveryUnit;
};

