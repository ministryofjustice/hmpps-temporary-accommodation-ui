/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ArrayOfOASysRiskContributorsQuestions } from './ArrayOfOASysRiskContributorsQuestions';
import type { OASysAssessmentId } from './OASysAssessmentId';
import type { OASysAssessmentState } from './OASysAssessmentState';

export type OASysRiskContributors = {
    assessmentId: OASysAssessmentId;
    assessmentState: OASysAssessmentState;
    dateStarted: string;
    dateCompleted?: string;
    riskContributors: ArrayOfOASysRiskContributorsQuestions;
};

