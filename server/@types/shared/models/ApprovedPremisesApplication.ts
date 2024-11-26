/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApArea } from './ApArea';
import type { Cas1ApplicationUserDetails } from './Cas1ApplicationUserDetails';
import type { Cas1CruManagementArea } from './Cas1CruManagementArea';
import type { FullPerson } from './FullPerson';
import type { PersonRisks } from './PersonRisks';
import type { RestrictedPerson } from './RestrictedPerson';
import type { UnknownPerson } from './UnknownPerson';
export type ApprovedPremisesApplication = {
    createdByUserId: string;
    schemaVersion: string;
    outdatedSchema: boolean;
    status: 'started' | 'submitted' | 'rejected' | 'awaitingAssesment' | 'unallocatedAssesment' | 'assesmentInProgress' | 'awaitingPlacement' | 'placementAllocated' | 'inapplicable' | 'withdrawn' | 'requestedFurtherInformation' | 'pendingPlacementRequest' | 'expired';
    type: string;
    id: string;
    person: (FullPerson | RestrictedPerson | UnknownPerson);
    createdAt: string;
    isWomensApplication?: boolean;
    /**
     * Use apType
     */
    isPipeApplication?: boolean;
    isEmergencyApplication?: boolean;
    /**
     * Use apType
     */
    isEsapApplication?: boolean;
    apType?: 'normal' | 'pipe' | 'esap' | 'rfap' | 'mhapStJosephs' | 'mhapElliottHouse';
    arrivalDate?: string;
    risks?: PersonRisks;
    /**
     * Any object that conforms to the current JSON schema for an application
     */
    data?: Record<string, any>;
    /**
     * Any object that conforms to the current JSON schema for an application
     */
    document?: Record<string, any>;
    assessmentId?: string;
    assessmentDecision?: 'accepted' | 'rejected';
    assessmentDecisionDate?: string;
    submittedAt?: string;
    personStatusOnSubmission?: 'InCustody' | 'InCommunity' | 'Unknown';
    apArea?: ApArea;
    cruManagementArea?: Cas1CruManagementArea;
    applicantUserDetails?: Cas1ApplicationUserDetails;
    /**
     * If true, caseManagerUserDetails will provide case manager details. Otherwise, applicantUserDetails can be used for case manager details
     */
    caseManagerIsNotApplicant?: boolean;
    caseManagerUserDetails?: Cas1ApplicationUserDetails;
    genderForAp?: 'male' | 'female';
};

