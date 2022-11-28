/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ArrayOfOASysRiskManagementQuestions } from './ArrayOfOASysRiskManagementQuestions';
import type { OASysAssessmentId } from './OASysAssessmentId';
import type { OASysAssessmentState } from './OASysAssessmentState';

export type OASysRiskManagementPlan = {
    assessmentId: OASysAssessmentId;
    assessmentState: OASysAssessmentState;
    dateStarted: string;
    dateCompleted?: string;
    riskManagementPlan: ArrayOfOASysRiskManagementQuestions;
};

