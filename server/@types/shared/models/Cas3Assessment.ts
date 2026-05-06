/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AssessmentDecision } from './AssessmentDecision';
import type { ClarificationNote } from './ClarificationNote';
import type { TemporaryAccommodationApplication } from './TemporaryAccommodationApplication';
import type { TemporaryAccommodationAssessmentStatus } from './TemporaryAccommodationAssessmentStatus';
import type { TemporaryAccommodationUser } from './TemporaryAccommodationUser';
export type Cas3Assessment = {
    accommodationRequiredFromDate?: string | null;
    allocatedAt?: string | null;
    allocatedToStaffMember?: (TemporaryAccommodationUser | null);
    application: TemporaryAccommodationApplication;
    clarificationNotes: Array<ClarificationNote>;
    createdAt: string;
    data?: null;
    decision?: (AssessmentDecision | null);
    id: string;
    rejectionRationale?: string | null;
    releaseDate?: string | null;
    status?: (TemporaryAccommodationAssessmentStatus | null);
    submittedAt?: string | null;
    summaryData: any;
};

