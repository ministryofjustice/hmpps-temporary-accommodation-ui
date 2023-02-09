import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { DateCapacity } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<DateCapacity>(() => ({
  availableBeds: faker.datatype.number({ min: -1, max: 2 }),
  date: DateFormats.dateObjToIsoDate(faker.date.soon()),
}))
