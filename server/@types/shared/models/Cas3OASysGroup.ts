/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas3OASysAssessmentMetadata } from './Cas3OASysAssessmentMetadata';
import type { OASysQuestion } from './OASysQuestion';
/**
 * Groups questions and answers from OAsys
 */
export type Cas3OASysGroup = {
    assessmentMetadata: Cas3OASysAssessmentMetadata;
    answers: Array<OASysQuestion>;
};

