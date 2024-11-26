/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas2Status } from './Cas2Status';
import type { ExternalUser } from './ExternalUser';
import type { PersonReference } from './PersonReference';
export type Cas2ApplicationStatusUpdatedEventDetails = {
    applicationId: string;
    applicationUrl: string;
    personReference: PersonReference;
    newStatus: Cas2Status;
    updatedBy: ExternalUser;
    updatedAt: string;
};

