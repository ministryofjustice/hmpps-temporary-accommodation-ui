/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ArrayOfOASysRiskOfSeriousHarmSummaryQuestions } from './ArrayOfOASysRiskOfSeriousHarmSummaryQuestions';
import type { OASysAssessmentId } from './OASysAssessmentId';
import type { OASysAssessmentState } from './OASysAssessmentState';

export type OASysRiskOfSeriousHarmSummary = {
    assessmentId: OASysAssessmentId;
    assessmentState: OASysAssessmentState;
    dateStarted: string;
    dateCompleted?: string;
    riskOfSeriousHarmSummary: ArrayOfOASysRiskOfSeriousHarmSummaryQuestions;
};

