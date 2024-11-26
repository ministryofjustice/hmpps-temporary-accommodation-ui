/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Information needed to submit a placement application
 */
export type PlacementApplicationDecisionEnvelope = {
    decision: 'accepted' | 'rejected' | 'withdraw' | 'withdrawn_by_pp';
    summaryOfChanges: string;
    decisionSummary: string;
};

