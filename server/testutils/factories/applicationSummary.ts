import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { ApplicationSummary } from 'approved-premises'
import personFactory from './person'

export default Factory.define<ApplicationSummary>(() => ({
  id: faker.datatype.uuid(),
  person: personFactory.build(),
  arrivalDate: faker.date.future().toISOString(),
  tier: {
    level: faker.helpers.arrayElement(
      ['A', 'B', 'C', 'D']
        .map(letter => {
          return [0, 1, 2, 3].map(number => `${letter}${number}`)
        })
        .flat(),
    ),
    lastUpdated: faker.date.recent().toISOString(),
  },
  currentLocation: faker.address.county(),
  daysSinceApplicationRecieved: faker.datatype.number({ min: 0, max: 90 }),
  status: faker.helpers.arrayElement(['In progress', 'Submitted', 'Information Requested', 'Rejected']),
}))
