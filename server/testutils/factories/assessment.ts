/* istanbul ignore file */

import { fakerEN_GB as faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import type {
  TemporaryAccommodationAssessment as Assessment,
  TemporaryAccommodationAssessmentStatus,
} from '@approved-premises/api'

import summaryData from '../../../cypress_shared/fixtures/summaryData.json'
import { DateFormats } from '../../utils/dateUtils'
import { fakeObject } from '../utils'
import applicationFactory from './application'

export default Factory.define<Assessment>(() => {
  const releaseDate = DateFormats.dateObjToIsoDate(faker.date.soon({ days: 10 }))
  const accommodationRequiredFromDate = DateFormats.dateObjToIsoDate(faker.date.soon({ days: 3, refDate: releaseDate }))

  return {
    id: faker.string.uuid(),
    application: applicationFactory.build(),
    summaryData,
    createdAt: DateFormats.dateObjToIsoDateTime(faker.date.past()),
    allocatedAt: DateFormats.dateObjToIsoDateTime(faker.date.past()),
    submittedAt: DateFormats.dateObjToIsoDateTime(faker.date.past()),
    decision: faker.helpers.arrayElement(['accepted' as const, 'rejected' as const, undefined]),
    data: fakeObject(),
    clarificationNotes: [],
    rejectionRationale: faker.lorem.sentence(),
    service: 'CAS3',
    status: faker.helpers.arrayElement([
      'unallocated' as const,
      'in_review' as const,
      'ready_to_place' as const,
      'closed' as const,
      'rejected' as const,
    ]) as TemporaryAccommodationAssessmentStatus,
    releaseDate,
    accommodationRequiredFromDate,
  }
})
