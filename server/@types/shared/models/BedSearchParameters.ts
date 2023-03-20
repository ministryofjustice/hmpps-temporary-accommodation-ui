/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type BedSearchParameters = {
    service?: string;
    /**
     * The date the Bed will need to be free from
     */
    start_date: string;
    /**
     * The number of days the Bed will need to be free from the start_date until
     */
    duration_days: number;
};

