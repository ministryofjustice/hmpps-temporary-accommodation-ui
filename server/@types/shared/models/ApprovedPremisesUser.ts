/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApArea } from './ApArea';
import type { NamedId } from './NamedId';
import type { User } from './User';
export type ApprovedPremisesUser = (User & {
    qualifications?: Array<'pipe' | 'lao' | 'emergency' | 'esap' | 'recovery_focused' | 'mental_health_specialist'>;
    roles?: Array<'assessor' | 'matcher' | 'manager' | 'legacy_manager' | 'future_manager' | 'workflow_manager' | 'cru_member' | 'cru_member_find_and_book_beta' | 'applicant' | 'role_admin' | 'report_viewer' | 'excluded_from_assess_allocation' | 'excluded_from_match_allocation' | 'excluded_from_placement_application_allocation' | 'appeals_manager' | 'janitor' | 'user_manager'>;
    apArea?: ApArea;
    cruManagementArea?: NamedId;
    cruManagementAreaDefault?: NamedId;
    permissions?: Array<'cas1_adhoc_booking_create' | 'cas1_application_withdraw_others' | 'cas1_assess_appealed_application' | 'cas1_assess_application' | 'cas1_assess_placement_application' | 'cas1_assess_placement_request' | 'cas1_booking_create' | 'cas1_booking_change_dates' | 'cas1_booking_withdraw' | 'cas1_out_of_service_bed_create' | 'cas1_process_an_appeal' | 'cas1_user_list' | 'cas1_user_management' | 'cas1_view_assigned_assessments' | 'cas1_view_cru_dashboard' | 'cas1_view_manage_tasks' | 'cas1_view_out_of_service_beds' | 'cas1_request_for_placement_withdraw_others' | 'cas1_space_booking_create' | 'cas1_space_booking_list' | 'cas1_space_booking_record_arrival' | 'cas1_space_booking_record_departure' | 'cas1_space_booking_record_non_arrival' | 'cas1_space_booking_record_keyworker' | 'cas1_space_booking_view' | 'cas1_space_booking_withdraw' | 'cas1_premises_view_capacity' | 'cas1_premises_view_summary' | 'cas1_reports_view'>;
    cruManagementAreaOverride?: NamedId;
    version?: number;
} & {
    qualifications: Array<'pipe' | 'lao' | 'emergency' | 'esap' | 'recovery_focused' | 'mental_health_specialist'>;
    roles: Array<'assessor' | 'matcher' | 'manager' | 'legacy_manager' | 'future_manager' | 'workflow_manager' | 'cru_member' | 'cru_member_find_and_book_beta' | 'applicant' | 'role_admin' | 'report_viewer' | 'excluded_from_assess_allocation' | 'excluded_from_match_allocation' | 'excluded_from_placement_application_allocation' | 'appeals_manager' | 'janitor' | 'user_manager'>;
    apArea: ApArea;
    cruManagementArea: NamedId;
    cruManagementAreaDefault: NamedId;
});

