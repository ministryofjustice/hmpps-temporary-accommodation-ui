/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PersonSummary } from './PersonSummary';
import type { TierDto } from './TierDto';
export type FullPersonSummary = (PersonSummary & {
    isRestricted?: boolean;
    name?: string;
    /**
     * The person's current tier, if available
     */
    tier?: TierDto;
} & {
    isRestricted: boolean;
    name: string;
});

