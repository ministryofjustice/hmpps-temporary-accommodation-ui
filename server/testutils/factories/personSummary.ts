import { fakerEN_GB as faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import type { FullPersonSummary, RestrictedPersonSummary, UnknownPersonSummary } from '@approved-premises/api'

const crn = () => `C${faker.number.int({ min: 100000, max: 999999 })}`

export const fullPersonSummaryFactory = Factory.define<FullPersonSummary>(() => ({
  crn: crn(),
  personType: 'FullPersonSummary',
  name: faker.person.fullName(),
  isRestricted: false,
}))

export const restrictedPersonSummaryFactory = Factory.define<RestrictedPersonSummary>(() => ({
  crn: crn(),
  personType: 'RestrictedPersonSummary',
}))

export const unknownPersonSummaryFactory = Factory.define<UnknownPersonSummary>(() => ({
  crn: crn(),
  personType: 'UnknownPersonSummary',
}))
