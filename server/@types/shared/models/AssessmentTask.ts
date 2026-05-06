/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApArea } from './ApArea';
import type { ApprovedPremisesUser } from './ApprovedPremisesUser';
import type { AssessmentDecision } from './AssessmentDecision';
import type { ProbationDeliveryUnit } from './ProbationDeliveryUnit';
import type { Task } from './Task';
export type AssessmentTask = (Task & {
    allocatedToStaffMember?: (ApprovedPremisesUser | null);
    apArea?: (ApArea | null);
    createdFromAppeal?: boolean;
    expectedArrivalDate?: string | null;
    outcome?: (AssessmentDecision | null);
    outcomeRecordedAt?: string | null;
    probationDeliveryUnit?: (ProbationDeliveryUnit | null);
} & {
    createdFromAppeal: boolean;
});

