/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ReferralHistoryNote } from './ReferralHistoryNote';
import type { ReferralHistoryNoteMessageDetails } from './ReferralHistoryNoteMessageDetails';
export type ReferralHistoryDomainEventNote = (ReferralHistoryNote & {
    message?: string | null;
    messageDetails?: (ReferralHistoryNoteMessageDetails | null);
});

