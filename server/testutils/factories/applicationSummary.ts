import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { Person, RiskTier } from '../../@types/shared'

import personFactory from './person'
import { riskTierLevel } from './risks'

export default Factory.define<ApplicationSummary>(() => ({
  id: faker.datatype.uuid(),
  person: personFactory.build(),
  arrivalDate: faker.date.future().toISOString(),
  tier: {
    level: riskTierLevel,
    lastUpdated: faker.date.recent().toISOString(),
  },
  currentLocation: faker.address.county(),
  daysSinceApplicationRecieved: faker.datatype.number({ min: 0, max: 90 }),
  status: faker.helpers.arrayElement(['In progress', 'Submitted', 'Information Requested', 'Rejected']),
}))

export type ApplicationSummary = {
  id: string
  person: Person
  tier: RiskTier
  currentLocation: string
  arrivalDate: string
  daysSinceApplicationRecieved: number
  status: 'In progress' | 'Submitted' | 'Information Requested' | 'Rejected'
}
