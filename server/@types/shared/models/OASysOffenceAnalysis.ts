/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ArrayOfOASysOffenceAnalysisQuestions } from './ArrayOfOASysOffenceAnalysisQuestions';
import type { OASysAssessmentId } from './OASysAssessmentId';

export type OASysOffenceAnalysis = {
    assessmentId: OASysAssessmentId;
    offenceAnalysis: ArrayOfOASysOffenceAnalysisQuestions;
};

