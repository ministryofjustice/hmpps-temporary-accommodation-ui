/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BedOccupancyBookingEntry } from './BedOccupancyBookingEntry';
import type { BedOccupancyLostBedEntry } from './BedOccupancyLostBedEntry';
import type { BedOccupancyOpenEntry } from './BedOccupancyOpenEntry';
export type BedOccupancyRange = {
    bedId: string;
    bedName: string;
    schedule: Array<(BedOccupancyBookingEntry | BedOccupancyLostBedEntry | BedOccupancyOpenEntry)>;
};

