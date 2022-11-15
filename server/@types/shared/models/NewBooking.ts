/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ServiceName } from './ServiceName';

export type NewBooking = {
    crn: string;
    arrivalDate: string;
    departureDate: string;
    serviceName: ServiceName;
};

