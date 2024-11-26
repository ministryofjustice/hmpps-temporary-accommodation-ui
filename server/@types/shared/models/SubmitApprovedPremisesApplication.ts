/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas1ApplicationUserDetails } from './Cas1ApplicationUserDetails';
import type { SubmitApplication } from './SubmitApplication';
export type SubmitApprovedPremisesApplication = (SubmitApplication & {
    targetLocation?: string;
    releaseType?: 'licence' | 'rotl' | 'hdc' | 'pss' | 'in_community' | 'not_applicable' | 'extendedDeterminateLicence' | 'paroleDirectedLicence' | 'reReleasedPostRecall';
    sentenceType?: 'standardDeterminate' | 'life' | 'ipp' | 'extendedDeterminate' | 'communityOrder' | 'bailPlacement' | 'nonStatutory';
    /**
     * Use apType
     */
    isPipeApplication?: boolean;
    isWomensApplication?: boolean;
    /**
     * noticeType should be used to indicate if this an emergency application
     */
    isEmergencyApplication?: boolean;
    /**
     * Use apType
     */
    isEsapApplication?: boolean;
    apType?: 'normal' | 'pipe' | 'esap' | 'rfap' | 'mhapStJosephs' | 'mhapElliottHouse';
    situation?: 'riskManagement' | 'residencyManagement' | 'bailAssessment' | 'bailSentence' | 'awaitingSentence';
    arrivalDate?: string;
    /**
     * If the user's ap area id is incorrect, they can optionally override it for the application
     */
    apAreaId?: string;
    applicantUserDetails?: Cas1ApplicationUserDetails;
    caseManagerIsNotApplicant?: boolean;
    caseManagerUserDetails?: Cas1ApplicationUserDetails;
    noticeType?: 'standard' | 'emergency' | 'shortNotice';
    reasonForShortNotice?: string;
    reasonForShortNoticeOther?: string;
} & {
    targetLocation: string;
    releaseType: 'licence' | 'rotl' | 'hdc' | 'pss' | 'in_community' | 'not_applicable' | 'extendedDeterminateLicence' | 'paroleDirectedLicence' | 'reReleasedPostRecall';
    sentenceType: 'standardDeterminate' | 'life' | 'ipp' | 'extendedDeterminate' | 'communityOrder' | 'bailPlacement' | 'nonStatutory';
});

