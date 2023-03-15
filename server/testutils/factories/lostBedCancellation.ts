import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { LostBedCancellation } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<LostBedCancellation>(() => ({
  id: faker.datatype.uuid(),
  notes: faker.lorem.sentence(),
  createdAt: DateFormats.dateObjToIsoDate(faker.date.past()),
}))
