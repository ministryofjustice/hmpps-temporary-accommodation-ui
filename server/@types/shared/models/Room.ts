/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Bed } from './Bed';
import type { Characteristic } from './Characteristic';

export type Room = {
    id: string;
    name: string;
    code?: string;
    notes?: string;
    beds?: Array<Bed>;
    characteristics: Array<Characteristic>;
};

