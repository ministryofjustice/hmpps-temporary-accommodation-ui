/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { NewBooking } from './NewBooking';

export type NewTemporaryAccommodationBooking = (NewBooking & {
    bedId: string;
});

