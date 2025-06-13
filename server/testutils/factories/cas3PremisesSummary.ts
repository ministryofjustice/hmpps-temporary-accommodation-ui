/* istanbul ignore file */

import { fakerEN_GB as faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import type { Cas3PremisesSummary as PremisesSummary } from '@approved-premises/api'
import referenceDataFactory from './referenceData'
import bedspaceSummaryFactory from './cas3BedspaceSummary'

export default Factory.define<PremisesSummary>(() => {
  const bedspaces = faker.helpers.multiple(() => bedspaceSummaryFactory.build(), { count: { min: 0, max: 10 } })

  return {
    id: faker.string.uuid(),
    name: `${faker.word.adjective()} ${faker.word.adverb()} ${faker.word.noun()}`,
    addressLine1: faker.location.streetAddress(),
    addressLine2: faker.location.secondaryAddress(),
    town: faker.location.city(),
    postcode: faker.location.zipCode(),
    bedspaces,
    bedspaceCount: bedspaces.length,
    status: faker.helpers.arrayElement(['active', 'archived'] as const),
    pdu: referenceDataFactory.pdu().build().name,
    service: 'CAS3',
  }
})
