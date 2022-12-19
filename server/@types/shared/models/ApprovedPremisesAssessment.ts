/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ApprovedPremisesApplication } from './ApprovedPremisesApplication';
import type { Assessment } from './Assessment';

export type ApprovedPremisesAssessment = (Assessment & {
    application: ApprovedPremisesApplication;
});

