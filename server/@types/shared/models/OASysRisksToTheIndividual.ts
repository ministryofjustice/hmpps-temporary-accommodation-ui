/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ArrayOfOASysRisksToTheIndividualQuestions } from './ArrayOfOASysRisksToTheIndividualQuestions';
import type { OASysAssessmentId } from './OASysAssessmentId';
import type { OASysAssessmentState } from './OASysAssessmentState';

export type OASysRisksToTheIndividual = {
    assessmentId: OASysAssessmentId;
    assessmentState: OASysAssessmentState;
    dateStarted: string;
    dateCompleted?: string;
    risksToTheIndividual: ArrayOfOASysRisksToTheIndividualQuestions;
};

