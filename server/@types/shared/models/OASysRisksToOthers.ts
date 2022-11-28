/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ArrayOfOASysRisksToOthersQuestions } from './ArrayOfOASysRisksToOthersQuestions';
import type { OASysAssessmentId } from './OASysAssessmentId';
import type { OASysAssessmentState } from './OASysAssessmentState';

export type OASysRisksToOthers = {
    assessmentId: OASysAssessmentId;
    assessmentState?: OASysAssessmentState;
    dateStarted: string;
    dateCompleted?: string;
    risksToOthers: ArrayOfOASysRisksToOthersQuestions;
};

