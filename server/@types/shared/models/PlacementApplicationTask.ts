/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas1RequestedPlacementPeriod } from './Cas1RequestedPlacementPeriod';
import type { PlacementApplicationDecision } from './PlacementApplicationDecision';
import type { PlacementType } from './PlacementType';
import type { RiskTierEnvelope } from './RiskTierEnvelope';
import type { Task } from './Task';
export type PlacementApplicationTask = (Task & {
    outcome?: PlacementApplicationDecision;
    placementType?: PlacementType;
    requestedPlacementPeriod?: Cas1RequestedPlacementPeriod;
    /**
     * Tier when the application was created
     */
    tier?: RiskTierEnvelope;
} & {
    placementType: PlacementType;
    requestedPlacementPeriod: Cas1RequestedPlacementPeriod;
    /**
     * Tier when the application was created
     */
    tier: RiskTierEnvelope;
});

