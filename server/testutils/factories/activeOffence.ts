import { fakerEN_GB as faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import type { ActiveOffence } from '@approved-premises/api'

import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<ActiveOffence>(() => ({
  deliusEventNumber: faker.string.uuid(),
  offenceDescription: faker.lorem.sentence(),
  offenceId: faker.string.uuid(),
  convictionId: faker.number.int(),
  offenceDate: DateFormats.dateObjToIsoDate(faker.date.past()),
}))
