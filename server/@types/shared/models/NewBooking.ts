/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type NewBooking = {
    crn: string;
    arrivalDate: string;
    departureDate: string;
    serviceName: 'approved-premises' | 'cas2' | 'temporary-accommodation';
    bedId?: string;
    enableTurnarounds?: boolean;
    assessmentId?: string;
    eventNumber?: string;
};

