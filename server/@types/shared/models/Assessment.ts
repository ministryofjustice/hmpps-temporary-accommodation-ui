/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ClarificationNote } from './ClarificationNote';
import type { ReferralHistoryDomainEventNote } from './ReferralHistoryDomainEventNote';
import type { ReferralHistorySystemNote } from './ReferralHistorySystemNote';
import type { ReferralHistoryUserNote } from './ReferralHistoryUserNote';
export type Assessment = {
    id: string;
    /**
     * Any object that conforms to the current JSON schema for an application
     */
    data?: Record<string, any>;
    service: string;
    allocatedAt?: string;
    decision?: 'accepted' | 'rejected';
    submittedAt?: string;
    createdAt: string;
    schemaVersion: string;
    clarificationNotes: Array<ClarificationNote>;
    rejectionRationale?: string;
    outdatedSchema: boolean;
    referralHistoryNotes?: Array<(ReferralHistoryDomainEventNote | ReferralHistorySystemNote | ReferralHistoryUserNote)>;
};

