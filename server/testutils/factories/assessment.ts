/* istanbul ignore file */

import { fakerEN_GB as faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import type { TemporaryAccommodationAssessment as Assessment } from '@approved-premises/api'

import summaryData from '../../../cypress_shared/fixtures/summaryData.json'
import { DateFormats } from '../../utils/dateUtils'
import { fakeObject } from '../utils'
import applicationFactory from './application'
import referralHistoryUserNoteFactory from './referralHistoryUserNote'

export default Factory.define<Assessment>(() => {
  const releaseDate = DateFormats.dateObjToIsoDate(faker.date.soon({ days: 10 }))
  const accommodationRequiredFromDate = DateFormats.dateObjToIsoDate(faker.date.soon({ days: 3, refDate: releaseDate }))

  return {
    id: faker.string.uuid(),
    application: applicationFactory.build(),
    summaryData,
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
    releaseDate,
    accommodationRequiredFromDate,
  }
})
