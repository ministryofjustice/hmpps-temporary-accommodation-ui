/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PlacementDates } from './PlacementDates';
/**
 * Information needed to submit a placement application
 */
export type SubmitPlacementApplication = {
    /**
     * Any object that conforms to the current JSON schema for an application
     */
    translatedDocument: Record<string, any>;
    placementType: 'rotl' | 'release_following_decision' | 'additional_placement';
    placementDates: Array<PlacementDates>;
};

