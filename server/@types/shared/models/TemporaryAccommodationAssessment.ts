/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Assessment } from './Assessment';
import type { TemporaryAccommodationApplication } from './TemporaryAccommodationApplication';

export type TemporaryAccommodationAssessment = (Assessment & {
    application: TemporaryAccommodationApplication;
});

