/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Application } from './Application';

export type ApprovedPremisesApplication = (Application & {
    isWomensApplication?: boolean;
    isPipeApplication?: boolean;
});

