/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas1PremiseCharacteristicAvailability } from './Cas1PremiseCharacteristicAvailability';
export type Cas1PremiseCapacityForDay = {
    /**
     * total bed count including temporarily unavailable beds (e.g. out of service beds)
     */
    totalBedCount: number;
    /**
     * total bed count excluding temporarily unavailable beds (e.g. out of service beds)
     */
    availableBedCount: number;
    bookingCount: number;
    characteristicAvailability: Array<Cas1PremiseCharacteristicAvailability>;
};

