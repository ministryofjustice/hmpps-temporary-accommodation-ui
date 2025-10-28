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
    accommodationRequiredFromDate?: string;
    allocatedAt?: string;
    allocatedToStaffMember?: TemporaryAccommodationUser;
    application: TemporaryAccommodationApplication;
    clarificationNotes: Array<ClarificationNote>;
    createdAt: string;
    data?: any;
    decision?: AssessmentDecision;
    id: string;
    rejectionRationale?: string;
    releaseDate?: string;
    status?: TemporaryAccommodationAssessmentStatus;
    submittedAt?: string;
    summaryData: any;
};

