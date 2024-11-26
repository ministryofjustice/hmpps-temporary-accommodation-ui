/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RiskTierEnvelope } from './RiskTierEnvelope';
import type { Task } from './Task';
export type PlacementRequestTask = (Task & {
    expectedArrival?: string;
    duration?: number;
    tier?: RiskTierEnvelope;
    releaseType?: 'licence' | 'rotl' | 'hdc' | 'pss' | 'in_community' | 'not_applicable' | 'extendedDeterminateLicence' | 'paroleDirectedLicence' | 'reReleasedPostRecall';
    placementRequestStatus?: 'notMatched' | 'unableToMatch' | 'matched';
    outcome?: 'matched' | 'unable_to_match';
} & {
    expectedArrival: string;
    duration: number;
    tier: RiskTierEnvelope;
    releaseType: 'licence' | 'rotl' | 'hdc' | 'pss' | 'in_community' | 'not_applicable' | 'extendedDeterminateLicence' | 'paroleDirectedLicence' | 'reReleasedPostRecall';
    placementRequestStatus: 'notMatched' | 'unableToMatch' | 'matched';
});

