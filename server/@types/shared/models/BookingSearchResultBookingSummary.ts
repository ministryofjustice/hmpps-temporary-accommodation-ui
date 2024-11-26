/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type BookingSearchResultBookingSummary = {
    id: string;
    status: 'arrived' | 'awaiting-arrival' | 'not-arrived' | 'departed' | 'cancelled' | 'provisional' | 'confirmed' | 'closed';
    startDate: string;
    endDate: string;
    createdAt: string;
};

