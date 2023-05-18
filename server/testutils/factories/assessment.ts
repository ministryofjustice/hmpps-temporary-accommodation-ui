/* istanbul ignore file */

import type { ApprovedPremisesAssessment } from '@approved-premises/api'
import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import { DateFormats } from '../../utils/dateUtils'
import applicationFactory from './application'

class AssessmentFactory extends Factory<ApprovedPremisesAssessment> {
  createdXDaysAgo(days: number) {
    const today = new Date()
    return this.params({
      createdAt: DateFormats.dateObjToIsoDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - days)),
    })
  }

  acceptedAssessment() {
    return this.params({
      data: { 'make-a-decision': { 'make-a-decision': { decision: 'releaseDate' } } },
    })
  }
}

export default AssessmentFactory.define(() => ({
  id: faker.string.uuid(),
  application: applicationFactory.withReleaseDate().build(),
  allocatedToStaffMemberId: faker.string.uuid(),
  schemaVersion: faker.string.uuid(),
  outdatedSchema: false,
  createdAt: DateFormats.dateObjToIsoDate(faker.date.past()),
  allocatedAt: DateFormats.dateObjToIsoDate(faker.date.past()),
  submittedAt: DateFormats.dateObjToIsoDate(faker.date.past()),
  decision: faker.helpers.arrayElement(['accepted' as const, 'rejected' as const, undefined]),
  data: JSON.parse(faker.datatype.json()),
  clarificationNotes: [],
  rejectionRationale: faker.lorem.sentence(),
}))
