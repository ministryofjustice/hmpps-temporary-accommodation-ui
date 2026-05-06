/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ServiceName } from './ServiceName';
export type Cas3NewBooking = {
    arrivalDate: string;
    assessmentId?: string | null;
    bedspaceId?: string | null;
    crn: string;
    departureDate: string;
    enableTurnarounds?: boolean | null;
    eventNumber?: string | null;
    serviceName: ServiceName;
};

