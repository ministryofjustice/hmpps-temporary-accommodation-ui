import type { ActiveOffence } from '@approved-premises/api'

import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<ActiveOffence>(() => ({
  deliusEventNumber: faker.datatype.uuid(),
  offenceDescription: faker.lorem.sentence(),
  offenceId: faker.datatype.uuid(),
  convictionId: faker.datatype.number(),
  offenceDate: DateFormats.dateObjToIsoDate(faker.date.past()),
}))
