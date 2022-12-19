/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Application } from './Application';
import type { PersonRisks } from './PersonRisks';

export type ApprovedPremisesApplication = (Application & {
    isWomensApplication?: boolean;
    isPipeApplication?: boolean;
    risks: PersonRisks;
});

