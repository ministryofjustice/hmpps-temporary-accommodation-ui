import { fakerEN_GB as faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import type { TemporaryAccommodationApplication } from '@approved-premises/api'

import applicationTranslatedDocument from '../../../cypress_shared/fixtures/applicationTranslatedDocument.json'
import { DateFormats } from '../../utils/dateUtils'
import { fakeObject } from '../utils'
import { fullPersonFactory } from './person'
import risksFactory from './risks'

class ApplicationFactory extends Factory<TemporaryAccommodationApplication> {
  withData() {
    return this.params({
      data: fakeObject(),
      document: fakeObject(),
    })
  }
}

export default ApplicationFactory.define(() => ({
  id: faker.string.uuid(),
  person: faker.helpers.arrayElement([fullPersonFactory.build()]),
  createdByUserId: faker.string.uuid(),
  schemaVersion: faker.string.uuid(),
  createdAt: DateFormats.dateObjToIsoDate(faker.date.past()),
  submittedAt: DateFormats.dateObjToIsoDate(faker.date.past()),
  data: {},
  document: applicationTranslatedDocument,
  offenceId: faker.string.uuid(),
  outdatedSchema: faker.datatype.boolean(),
  risks: risksFactory.build(),
  status: 'inProgress' as const,
  type: 'CAS3',
  arrivalDate: DateFormats.dateObjToIsoDate(faker.date.past()),
}))
