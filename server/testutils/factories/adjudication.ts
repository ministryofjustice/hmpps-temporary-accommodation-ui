import type { Adjudication } from '@approved-premises/api'

import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<Adjudication>(() => ({
  id: faker.datatype.number(),
  reportedAt: DateFormats.dateObjToIsoDate(faker.date.past()),
  establishment: faker.address.cityName(),
  offenceDescription: faker.lorem.sentence(),
  hearingHeld: faker.datatype.boolean(),
  finding: faker.helpers.arrayElement(['PROVED', 'NOT_PROVED']),
}))
