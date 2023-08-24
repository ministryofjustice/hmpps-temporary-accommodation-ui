/* istanbul ignore file */

import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'
import type { TemporaryAccommodationAssessment as Assessment } from '@approved-premises/api'

import { DateFormats } from '../../utils/dateUtils'
import { fakeObject } from '../utils'
import applicationFactory from './application'
import referralHistoryUserNoteFactory from './referralHistoryUserNote'

class AssessmentFactory extends Factory<Assessment> {
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
  data: fakeObject(),
  clarificationNotes: [],
  rejectionRationale: faker.lorem.sentence(),
  referralHistoryNotes: referralHistoryUserNoteFactory.buildList(5),
  service: 'CAS3',
  status: faker.helpers.arrayElement([
    'unallocated' as const,
    'in_review' as const,
    'ready_to_place' as const,
    'closed' as const,
    'rejected' as const,
  ]),
}))
