/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PlacementDates } from './PlacementDates';
import type { RiskTierEnvelope } from './RiskTierEnvelope';
import type { Task } from './Task';
export type PlacementApplicationTask = (Task & {
    tier?: RiskTierEnvelope;
    releaseType?: 'licence' | 'rotl' | 'hdc' | 'pss' | 'in_community' | 'not_applicable' | 'extendedDeterminateLicence' | 'paroleDirectedLicence' | 'reReleasedPostRecall';
    placementType?: 'rotl' | 'release_following_decision' | 'additional_placement';
    placementDates?: Array<PlacementDates>;
    outcome?: 'accepted' | 'rejected' | 'withdraw' | 'withdrawn_by_pp';
} & {
    tier: RiskTierEnvelope;
    releaseType: 'licence' | 'rotl' | 'hdc' | 'pss' | 'in_community' | 'not_applicable' | 'extendedDeterminateLicence' | 'paroleDirectedLicence' | 'reReleasedPostRecall';
    placementType: 'rotl' | 'release_following_decision' | 'additional_placement';
});

