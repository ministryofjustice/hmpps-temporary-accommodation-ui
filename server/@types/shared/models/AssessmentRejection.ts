/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type AssessmentRejection = {
    agreeWithShortNoticeReason?: boolean | null;
    agreeWithShortNoticeReasonComments?: string | null;
    document: any;
    isWithdrawn?: boolean | null;
    reasonForLateApplication?: string | null;
    /**
     * Only used by CAS3
     */
    referralRejectionReasonDetail?: string | null;
    /**
     * Only used by CAS3
     */
    referralRejectionReasonId?: string | null;
    rejectionRationale: string;
};

