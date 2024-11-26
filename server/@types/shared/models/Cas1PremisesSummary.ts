/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApArea } from './ApArea';
export type Cas1PremisesSummary = {
    id: string;
    name: string;
    apCode: string;
    postcode: string;
    apArea: ApArea;
    /**
     * The total number of spaces in this premises
     */
    bedCount: number;
    /**
     * The total number of spaces available right now
     */
    availableBeds: number;
    /**
     * The total number of out of service beds
     */
    outOfServiceBeds: number;
    supportsSpaceBookings: boolean;
};

