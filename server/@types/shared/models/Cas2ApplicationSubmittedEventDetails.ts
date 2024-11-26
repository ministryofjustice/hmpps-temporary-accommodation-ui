/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas2ApplicationSubmittedEventDetailsSubmittedBy } from './Cas2ApplicationSubmittedEventDetailsSubmittedBy';
import type { PersonReference } from './PersonReference';
export type Cas2ApplicationSubmittedEventDetails = {
    applicationId: string;
    applicationUrl: string;
    personReference: PersonReference;
    submittedAt: string;
    submittedBy: Cas2ApplicationSubmittedEventDetailsSubmittedBy;
    referringPrisonCode?: string;
    preferredAreas?: string;
    hdcEligibilityDate?: string;
    conditionalReleaseDate?: string;
};

