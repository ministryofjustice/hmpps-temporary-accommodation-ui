/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Premises } from './Premises';

export type ApprovedPremises = (Premises & {
    apCode?: string;
} & {
    apCode: string;
});

