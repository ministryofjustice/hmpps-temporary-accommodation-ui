/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas1RequestedPlacementPeriod } from './Cas1RequestedPlacementPeriod';
import type { PlacementDates } from './PlacementDates';
import type { RequestForPlacementStatus } from './RequestForPlacementStatus';
import type { RequestForPlacementType } from './RequestForPlacementType';
import type { WithdrawPlacementRequestReason } from './WithdrawPlacementRequestReason';
export type RequestForPlacement = {
    authorisedPlacementPeriod?: Cas1RequestedPlacementPeriod;
    /**
     * If true, the user making this request can withdraw this request for placement.  If false, it may still be possible to indirectly withdraw this request for placement by withdrawing the application.
     */
    canBeDirectlyWithdrawn: boolean;
    createdAt: string;
    createdByUserId: string;
    document?: any;
    /**
     * If `type` is `"manual"`, provides the `PlacementApplication` ID. If `type` is `"automatic"` this field provides a `PlacementRequest` ID.
     */
    id: string;
    isWithdrawn: boolean;
    /**
     * Requests for placements only have one set of placement dates, use 'requestedPlacementPeriod' or 'authorisedPlacementPeriod' instead
     */
    placementDates: Array<PlacementDates>;
    /**
     * If `type` is `"manual"`, provides the value of `PlacementApplication.decisionMadeAt`. If `type` is `"automatic"` this field provides the value of `PlacementRequest.assessmentCompletedAt`.
     */
    requestReviewedAt?: string;
    requestedPlacementPeriod: Cas1RequestedPlacementPeriod;
    status: RequestForPlacementStatus;
    submittedAt?: string;
    type: RequestForPlacementType;
    withdrawalReason?: WithdrawPlacementRequestReason;
};

