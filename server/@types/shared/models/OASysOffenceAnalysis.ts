/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ArrayOfOASysOffenceAnalysisQuestions } from './ArrayOfOASysOffenceAnalysisQuestions';
import type { OASysAssessmentId } from './OASysAssessmentId';
import type { OASysAssessmentState } from './OASysAssessmentState';

export type OASysOffenceAnalysis = {
    assessmentId: OASysAssessmentId;
    assessmentState: OASysAssessmentState;
    dateStarted: string;
    dateCompleted?: string;
    offenceAnalysis: ArrayOfOASysOffenceAnalysisQuestions;
};

