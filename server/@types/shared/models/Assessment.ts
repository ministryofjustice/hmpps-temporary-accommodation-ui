/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AnyValue } from './AnyValue';
import type { Application } from './Application';
import type { AssessmentDecision } from './AssessmentDecision';
import type { ClarificationNote } from './ClarificationNote';

export type Assessment = {
    id: string;
    application: Application;
    allocatedToStaffMemberId?: string;
    schemaVersion: string;
    outdatedSchema: boolean;
    createdAt: string;
    allocatedAt: string;
    submittedAt?: string;
    decision?: AssessmentDecision;
    data: AnyValue;
    clarificationNotes: Array<ClarificationNote>;
};

