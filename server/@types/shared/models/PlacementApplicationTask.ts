/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PlacementApplicationDecision } from './PlacementApplicationDecision';
import type { PlacementDates } from './PlacementDates';
import type { PlacementType } from './PlacementType';
import type { RiskTierEnvelope } from './RiskTierEnvelope';
import type { Task } from './Task';
export type PlacementApplicationTask = (Task & {
    dates?: PlacementDates;
    outcome?: PlacementApplicationDecision;
    /**
     * Placement apps only have one set of placement dates, use 'dates' instead
     */
    placementDates?: Array<PlacementDates>;
    placementType?: PlacementType;
    /**
     * Tier when the application was created
     */
    tier?: RiskTierEnvelope;
} & {
    dates: PlacementDates;
    placementType: PlacementType;
    /**
     * Tier when the application was created
     */
    tier: RiskTierEnvelope;
});

