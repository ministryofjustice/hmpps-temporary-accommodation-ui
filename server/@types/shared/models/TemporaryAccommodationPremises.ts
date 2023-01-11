/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Premises } from './Premises';

export type TemporaryAccommodationPremises = (Premises & {
    pdu?: string;
} & {
    pdu: string;
});

