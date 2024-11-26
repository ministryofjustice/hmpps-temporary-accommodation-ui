/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApArea } from './ApArea';
import type { ApprovedPremisesUser } from './ApprovedPremisesUser';
import type { FullPersonSummary } from './FullPersonSummary';
import type { ProbationDeliveryUnit } from './ProbationDeliveryUnit';
import type { RestrictedPersonSummary } from './RestrictedPersonSummary';
import type { UnknownPersonSummary } from './UnknownPersonSummary';
export type Task = {
    id: string;
    crn: string;
    apArea?: ApArea;
    dueAt: string;
    /**
     * Superseded by personSummary which provides 'name' as well as 'personType' and 'crn'.
     */
    personName: string;
    status: 'not_started' | 'in_progress' | 'complete' | 'info_requested';
    taskType: 'Assessment' | 'PlacementRequest' | 'PlacementApplication' | 'BookingAppeal';
    /**
     * The Due date of the task - this is deprecated in favour of the `dueAt` field
     */
    dueDate: string;
    applicationId: string;
    outcomeRecordedAt?: string;
    personSummary: (FullPersonSummary | RestrictedPersonSummary | UnknownPersonSummary);
    probationDeliveryUnit?: ProbationDeliveryUnit;
    allocatedToStaffMember?: ApprovedPremisesUser;
};

