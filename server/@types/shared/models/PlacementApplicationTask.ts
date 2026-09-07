/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas1RequestedPlacementPeriod } from './Cas1RequestedPlacementPeriod';
import type { PlacementApplicationDecision } from './PlacementApplicationDecision';
import type { PlacementDates } from './PlacementDates';
import type { PlacementType } from './PlacementType';
import type { RiskTierEnvelope } from './RiskTierEnvelope';
import type { Task } from './Task';
export type PlacementApplicationTask = (Task & {
    /**
     * Use requestedPlacementPeriod
     * @deprecated
     */
    dates?: PlacementDates;
    outcome?: PlacementApplicationDecision;
    /**
     * Use requestedPlacementPeriod
     * @deprecated
     */
    placementDates?: Array<PlacementDates>;
    placementType?: PlacementType;
    requestedPlacementPeriod?: Cas1RequestedPlacementPeriod;
    /**
     * Tier when the application was created
     */
    tier?: RiskTierEnvelope;
} & {
    /**
     * Use requestedPlacementPeriod
     * @deprecated
     */
    dates: PlacementDates;
    placementType: PlacementType;
    requestedPlacementPeriod: Cas1RequestedPlacementPeriod;
    /**
     * Tier when the application was created
     */
    tier: RiskTierEnvelope;
});

