/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ApprovedPremisesUser } from './ApprovedPremisesUser';
import type { AssessmentDecision } from './AssessmentDecision';
import type { Person } from './Person';
import type { PersonRisks } from './PersonRisks';
import type { PlacementRequestStatus } from './PlacementRequestStatus';
import type { PlacementRequirements } from './PlacementRequirements';
import type { ReleaseTypeOption } from './ReleaseTypeOption';

export type PlacementRequest = (PlacementRequirements & {
    id?: string;
    person?: Person;
    risks?: PersonRisks;
    applicationId?: string;
    assessmentId?: string;
    releaseType?: ReleaseTypeOption;
    status?: PlacementRequestStatus;
    assessmentDecision?: AssessmentDecision;
    assessmentDate?: string;
    assessor?: ApprovedPremisesUser;
} & {
    id: string;
    person: Person;
    risks: PersonRisks;
    applicationId: string;
    assessmentId: string;
    releaseType: ReleaseTypeOption;
    status: PlacementRequestStatus;
    assessmentDecision: AssessmentDecision;
    assessmentDate: string;
    assessor: ApprovedPremisesUser;
});

