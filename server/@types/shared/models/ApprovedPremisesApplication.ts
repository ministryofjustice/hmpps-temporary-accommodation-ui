/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApArea } from './ApArea';
import type { Application } from './Application';
import type { ApprovedPremisesApplicationStatus } from './ApprovedPremisesApplicationStatus';
import type { ApType } from './ApType';
import type { AssessmentDecision } from './AssessmentDecision';
import type { Cas1ApplicationUserDetails } from './Cas1ApplicationUserDetails';
import type { Cas1CruManagementArea } from './Cas1CruManagementArea';
import type { PersonRisks } from './PersonRisks';
import type { PersonStatus } from './PersonStatus';
import type { ReleaseTypeOption } from './ReleaseTypeOption';
import type { SentenceTypeOption } from './SentenceTypeOption';
export type ApprovedPremisesApplication = (Application & {
    apArea?: ApArea;
    apType?: ApType;
    applicantUserDetails?: Cas1ApplicationUserDetails;
    arrivalDate?: string;
    assessmentDecision?: AssessmentDecision;
    assessmentDecisionDate?: string;
    assessmentId?: string;
    /**
     * If true, caseManagerUserDetails will provide case manager details. Otherwise, applicantUserDetails can be used for case manager details
     */
    caseManagerIsNotApplicant?: boolean;
    caseManagerUserDetails?: Cas1ApplicationUserDetails;
    createdByUserId?: string;
    cruManagementArea?: Cas1CruManagementArea;
    data?: any;
    document?: any;
    isEmergencyApplication?: boolean;
    isWomensApplication?: boolean;
    licenceExpiryDate?: string;
    personStatusOnSubmission?: PersonStatus;
    releaseType?: ReleaseTypeOption;
    risks?: PersonRisks;
    sentenceType?: SentenceTypeOption;
    status?: ApprovedPremisesApplicationStatus;
    submittedAt?: string;
} & {
    createdByUserId: string;
    status: ApprovedPremisesApplicationStatus;
});

