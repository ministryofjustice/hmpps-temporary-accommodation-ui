/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ApprovedPremisesUser } from './ApprovedPremisesUser';
import type { Person } from './Person';

export type Task = {
    applicationId?: string;
    person?: Person;
    dueDate?: string;
    allocatedToStaffMember?: ApprovedPremisesUser;
    status?: 'not_started' | 'in_progress' | 'complete';
    taskType?: 'Assessment' | 'PlacementRequest' | 'PlacementRequestReview' | 'BookingAppeal';
};

