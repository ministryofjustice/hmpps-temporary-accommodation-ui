/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type Characteristic = {
    id: string;
    name: string;
    serviceScope: 'approved-premises' | 'temporary-accommodation' | '*';
    modelScope: 'premises' | 'room' | '*';
};

