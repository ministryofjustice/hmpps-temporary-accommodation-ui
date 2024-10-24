import { fakerEN_GB as faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import type { Adjudication } from '@approved-premises/api'

import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<Adjudication>(() => ({
  id: faker.number.int(),
  reportedAt: DateFormats.dateObjToIsoDate(faker.date.past()),
  establishment: faker.location.city(),
  offenceDescription: faker.lorem.sentence(),
  hearingHeld: faker.datatype.boolean(),
  finding: faker.helpers.arrayElement(['PROVED', 'NOT_PROVED']),
}))
