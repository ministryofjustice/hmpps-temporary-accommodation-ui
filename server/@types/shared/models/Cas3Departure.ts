/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DepartureReason } from './DepartureReason';
import type { MoveOnCategory } from './MoveOnCategory';
export type Cas3Departure = {
    bookingId: string;
    createdAt: string;
    dateTime: string;
    id: string;
    moveOnCategory: MoveOnCategory;
    notes?: string;
    reason: DepartureReason;
};

