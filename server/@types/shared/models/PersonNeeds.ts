/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { PersonNeed } from './PersonNeed';

export type PersonNeeds = {
    linkedToRiskOfSeriousHarm: Array<PersonNeed>;
    linkedToReoffending: Array<PersonNeed>;
    notLinkedToSeriousHarmOrReoffending: Array<PersonNeed>;
};

