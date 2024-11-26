/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UpdateApplication } from './UpdateApplication';
export type UpdateApprovedPremisesApplication = (UpdateApplication & {
    isInapplicable?: boolean;
    isWomensApplication?: boolean;
    /**
     * Use apType
     */
    isPipeApplication?: boolean;
    /**
     * noticeType should be used to indicate if an emergency application
     */
    isEmergencyApplication?: boolean;
    /**
     * Use apType
     */
    isEsapApplication?: boolean;
    apType?: 'normal' | 'pipe' | 'esap' | 'rfap' | 'mhapStJosephs' | 'mhapElliottHouse';
    targetLocation?: string;
    releaseType?: 'licence' | 'rotl' | 'hdc' | 'pss' | 'in_community' | 'not_applicable' | 'extendedDeterminateLicence' | 'paroleDirectedLicence' | 'reReleasedPostRecall';
    arrivalDate?: string;
    noticeType?: 'standard' | 'emergency' | 'shortNotice';
});

