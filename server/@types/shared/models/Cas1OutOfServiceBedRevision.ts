/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApprovedPremisesUser } from './ApprovedPremisesUser';
import type { Cas1OutOfServiceBedReason } from './Cas1OutOfServiceBedReason';
import type { TemporaryAccommodationUser } from './TemporaryAccommodationUser';
export type Cas1OutOfServiceBedRevision = {
    id: string;
    updatedAt: string;
    revisionType: Array<'created' | 'updatedStartDate' | 'updatedEndDate' | 'updatedReferenceNumber' | 'updatedReason' | 'updatedNotes'>;
    updatedBy?: (ApprovedPremisesUser | TemporaryAccommodationUser);
    startDate?: string;
    endDate?: string;
    reason?: Cas1OutOfServiceBedReason;
    referenceNumber?: string;
    notes?: string;
};

