import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { TemporaryAccommodationApplicationSummary as ApplicationSummary } from '@approved-premises/api'

import { DateFormats } from '../../utils/dateUtils'
import { fullPersonFactory as personFactory } from './person'

export default Factory.define<ApplicationSummary>(() => ({
  id: faker.string.uuid(),
  person: personFactory.build(),
  createdAt: DateFormats.dateObjToIsoDateTime(faker.date.past()),
  submittedAt: DateFormats.dateObjToIsoDateTime(faker.date.past()),
  createdByUserId: faker.string.uuid(),
  status: 'inProgress',
  type: 'CAS3',
}))
