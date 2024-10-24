import { fakerEN_GB as faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import type { LostBedCancellation } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<LostBedCancellation>(() => ({
  id: faker.string.uuid(),
  notes: faker.lorem.sentence(),
  createdAt: DateFormats.dateObjToIsoDate(faker.date.past()),
}))
