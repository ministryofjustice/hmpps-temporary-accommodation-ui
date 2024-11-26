/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LatestCas2StatusUpdate } from './LatestCas2StatusUpdate';
import type { PersonRisks } from './PersonRisks';
export type Cas2ApplicationSummary = {
    type: string;
    id: string;
    createdAt: string;
    createdByUserId: string;
    status: 'inProgress' | 'submitted' | 'requestedFurtherInformation' | 'pending' | 'rejected' | 'awaitingPlacement' | 'placed' | 'inapplicable' | 'withdrawn';
    personName: string;
    crn: string;
    nomsNumber: string;
    submittedAt?: string;
    createdByUserName?: string;
    latestStatusUpdate?: LatestCas2StatusUpdate;
    risks?: PersonRisks;
    hdcEligibilityDate?: string;
};

