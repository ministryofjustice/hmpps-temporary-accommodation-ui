/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DepartureReason } from './DepartureReason';
import type { MoveOnCategory } from './MoveOnCategory';
export type Cas3Departure = {
    id: string;
    bookingId: string;
    dateTime: string;
    reason: DepartureReason;
    notes?: string;
    moveOnCategory: MoveOnCategory;
    createdAt: string;
};

