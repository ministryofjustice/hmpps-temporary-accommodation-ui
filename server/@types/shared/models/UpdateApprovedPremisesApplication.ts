/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ReleaseTypeOption } from './ReleaseTypeOption';
import type { UpdateApplication } from './UpdateApplication';

export type UpdateApprovedPremisesApplication = (UpdateApplication & {
    isWomensApplication?: boolean;
    isPipeApplication?: boolean;
    targetLocation?: string;
    releaseType?: ReleaseTypeOption;
    arrivalDate?: string;
});

