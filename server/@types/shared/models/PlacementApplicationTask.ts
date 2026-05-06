/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApArea } from './ApArea';
import type { ApprovedPremisesUser } from './ApprovedPremisesUser';
import type { PlacementApplicationDecision } from './PlacementApplicationDecision';
import type { PlacementDates } from './PlacementDates';
import type { PlacementType } from './PlacementType';
import type { ProbationDeliveryUnit } from './ProbationDeliveryUnit';
import type { ReleaseTypeOption } from './ReleaseTypeOption';
import type { RiskTierEnvelope } from './RiskTierEnvelope';
import type { Task } from './Task';
export type PlacementApplicationTask = (Task & {
    allocatedToStaffMember?: (ApprovedPremisesUser | null);
    apArea?: (ApArea | null);
    dates?: PlacementDates;
    expectedArrivalDate?: string | null;
    outcome?: (PlacementApplicationDecision | null);
    outcomeRecordedAt?: string | null;
    /**
     * Placement apps only have one set of placement dates, use 'dates' instead
     */
    placementDates?: any[] | null;
    placementType?: PlacementType;
    probationDeliveryUnit?: (ProbationDeliveryUnit | null);
    releaseType?: ReleaseTypeOption;
    tier?: RiskTierEnvelope;
} & {
    dates: PlacementDates;
    placementType: PlacementType;
    releaseType: ReleaseTypeOption;
    tier: RiskTierEnvelope;
});

