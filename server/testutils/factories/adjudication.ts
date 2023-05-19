import type { Adjudication } from '@approved-premises/api'

import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<Adjudication>(() => ({
  id: faker.number.int(),
  reportedAt: DateFormats.dateObjToIsoDate(faker.date.past()),
  establishment: faker.location.city(),
  offenceDescription: faker.lorem.sentence(),
  hearingHeld: faker.datatype.boolean(),
  finding: faker.helpers.arrayElement(['PROVED', 'NOT_PROVED']),
}))
