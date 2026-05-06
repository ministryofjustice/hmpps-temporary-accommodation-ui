/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Category } from './Category';
import type { ReferralHistoryNote } from './ReferralHistoryNote';
import type { ReferralHistoryNoteMessageDetails } from './ReferralHistoryNoteMessageDetails';
export type ReferralHistorySystemNote = (ReferralHistoryNote & {
    category?: Category;
    message?: string | null;
    messageDetails?: (ReferralHistoryNoteMessageDetails | null);
} & {
    category: Category;
});

