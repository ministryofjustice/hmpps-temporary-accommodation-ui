/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AnyValue } from './AnyValue';
import type { NewPlacementApplication } from './NewPlacementApplication';

export type PlacementApplication = (NewPlacementApplication & {
    id: string;
    createdByUserId: string;
    schemaVersion: string;
    outdatedSchema?: boolean;
    createdAt: string;
    submittedAt?: string;
    assessmentId: string;
    assessmentCompletedAt: string;
    applicationCompletedAt: string;
    data?: AnyValue;
    document?: AnyValue;
});

