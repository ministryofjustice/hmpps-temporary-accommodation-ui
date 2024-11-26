/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OASysQuestion } from './OASysQuestion';
export type OASysRiskOfSeriousHarm = {
    /**
     * The ID of assessment being used. This should always be the latest Layer 3 assessment, regardless of state.
     */
    assessmentId: number;
    assessmentState: 'Completed' | 'Incomplete';
    dateStarted: string;
    rosh: Array<OASysQuestion>;
    dateCompleted?: string;
};

