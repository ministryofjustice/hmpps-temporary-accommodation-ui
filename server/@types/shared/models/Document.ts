/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { DocumentLevel } from './DocumentLevel';

/**
 * Meta Info about a file relating to an Offender
 */
export type Document = {
    id: string;
    level: DocumentLevel;
    fileName: string;
    createdAt: string;
    typeCode: string;
    typeDescription: string;
    description?: string;
};

