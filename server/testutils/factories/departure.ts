import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { Departure } from 'approved-premises'

export default Factory.define<Departure>(() => ({
  id: faker.datatype.uuid(),
  dateTime: faker.date.soon().toISOString(),
  bookingId: faker.datatype.uuid(),
  reason: faker.helpers.arrayElement(['absconded', 'bed-withdrawn', 'recall', 'died', 'other']),
  notes: faker.lorem.sentence(),
  moveOnCategory: faker.helpers.arrayElement(['b&b', 'custody', 'no-fixed-abode', 'not-applicable', 'private-rented']),
  destinationProvider: faker.helpers.arrayElement([
    'east-of-england',
    'london',
    'wales',
    'greater-manchester',
    'yorkshire-and-the-humber',
  ]),
  destinationAp: faker.address.street(),
}))
