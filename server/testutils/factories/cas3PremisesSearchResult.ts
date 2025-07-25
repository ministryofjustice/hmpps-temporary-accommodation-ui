import type { Cas3PremisesSearchResult } from '@approved-premises/api'
import { Factory } from 'fishery'
import { fakerEN_GB as faker } from '@faker-js/faker'
import referenceDataFactory from './referenceData'
import bedspaceSummaryFactory from './cas3BedspaceSummary'

export default Factory.define<Cas3PremisesSearchResult>(() => {
  const bedspaces = faker.helpers.multiple(() => bedspaceSummaryFactory.build(), { count: { min: 0, max: 10 } })

  return {
    id: faker.string.uuid(),
    reference: `${faker.word.adjective()} ${faker.word.adverb()} ${faker.word.noun()}`,
    addressLine1: faker.location.streetAddress(),
    addressLine2: faker.location.secondaryAddress(),
    town: faker.location.city(),
    postcode: faker.location.zipCode(),
    bedspaces,
    pdu: referenceDataFactory.pdu().build().name,
    localAuthorityAreaName: faker.location.county(),
    totalArchivedBedspaces: bedspaces.filter(bed => bed.status === 'archived').length,
  }
})
