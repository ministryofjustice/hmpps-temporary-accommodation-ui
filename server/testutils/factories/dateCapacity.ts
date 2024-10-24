import { fakerEN_GB as faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import type { DateCapacity } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<DateCapacity>(() => ({
  availableBeds: faker.number.int({ min: -1, max: 2 }),
  date: DateFormats.dateObjToIsoDate(faker.date.soon()),
}))
