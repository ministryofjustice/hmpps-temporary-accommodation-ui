/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Arrival } from './Arrival';
import type { BookingBody } from './BookingBody';
import type { Cancellation } from './Cancellation';
import type { Confirmation } from './Confirmation';
import type { Departure } from './Departure';
import type { Extension } from './Extension';
import type { Nonarrival } from './Nonarrival';

export type Booking = (BookingBody & {
    status: 'arrived' | 'awaiting-arrival' | 'not-arrived' | 'departed' | 'cancelled' | 'provisional' | 'confirmed';
    extensions: Array<Extension>;
    arrival?: Arrival | null;
    departure?: Departure | null;
    nonArrival?: Nonarrival | null;
    cancellation?: Cancellation | null;
    confirmation?: Confirmation | null;
});

