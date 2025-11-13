import { fakerEN_GB as faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import { Cas3Application } from '@approved-premises/api'
import { fullPersonFactory } from './person'
import { DateFormats } from '../../utils/dateUtils'
import applicationTranslatedDocument from '../../../cypress_shared/fixtures/applicationTranslatedDocument.json'
import risksFactory from './risks'

export default Factory.define<Cas3Application>(() => ({
  id: faker.string.uuid(),
  person: faker.helpers.arrayElement([fullPersonFactory.build()]),
  createdAt: DateFormats.dateObjToIsoDateTime(faker.date.past()),
  createdByUserId: faker.string.uuid(),
  data: {},
  document: applicationTranslatedDocument,
  status: 'inProgress' as const,
  risks: risksFactory.build(),
  submittedAt: DateFormats.dateObjToIsoDateTime(faker.date.past()),
  arrivalDate: DateFormats.dateObjToIsoDateTime(faker.date.past()),
  offenceId: faker.string.uuid(),
  assessmentId: faker.string.uuid(),
  assessmentDecision: 'accepted' as const,
}))
