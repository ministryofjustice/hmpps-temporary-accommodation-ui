/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DatePeriod } from './DatePeriod';
export type Withdrawable = {
    id: string;
    type: 'application' | 'booking' | 'placement_application' | 'placement_request' | 'space_booking';
    /**
     * 0, 1 or more dates can be specified depending upon the WithdrawableType
     */
    dates: Array<DatePeriod>;
};

