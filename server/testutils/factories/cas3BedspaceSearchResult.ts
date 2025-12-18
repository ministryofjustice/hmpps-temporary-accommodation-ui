import { Factory } from 'fishery'

import { faker } from '@faker-js/faker'
import type {
  Cas3Bedspace,
  Cas3BedspaceSearchResultBedspaceSummary,
  Cas3BedspaceSearchResultPremisesSummary,
  Cas3Premises,
  Cas3v2BedspaceSearchResult,
} from '@approved-premises/api'
import cas3PremisesFactory from './cas3Premises'
import cas3BedspaceSearchResultOverlapFactory from './cas3BedspaceSearchResultOverlap'
import cas3BedspaceFactory from './cas3Bedspace'

class Cas3BedspaceSearchResultFactory extends Factory<Cas3v2BedspaceSearchResult> {
  /* istanbul ignore next */
  forPremises(premises: Cas3Premises) {
    return this.params({
      premises: premisesToPremisesSummary(premises),
    })
  }

  /* istanbul ignore next */
  forBedspace(premises: Cas3Premises, bedspace: Cas3Bedspace) {
    return this.params({
      premises: premisesToPremisesSummary(premises),
      bedspace: bedspaceToBedspaceSummary(bedspace),
    })
  }
}

export default Cas3BedspaceSearchResultFactory.define(() => {
  const premises = cas3PremisesFactory.build()
  const bedspace = cas3BedspaceFactory.build()

  return {
    premises: premisesToPremisesSummary(premises),
    bedspace: bedspaceToBedspaceSummary(bedspace),
    overlaps: cas3BedspaceSearchResultOverlapFactory.buildList(faker.number.int({ min: 0, max: 5 })),
  }
})

const premisesToPremisesSummary = (premises: Cas3Premises): Cas3BedspaceSearchResultPremisesSummary => ({
  id: premises.id,
  name: '',
  addressLine1: premises.addressLine1,
  addressLine2: premises.addressLine2,
  town: premises.town,
  postcode: premises.postcode,
  characteristics: premises.premisesCharacteristics.map(characteristic => ({
    name: characteristic.name,
    description: characteristic.description,
  })),
  bedspaceCount: faker.number.int({ min: 1, max: 10 }),
  notes: premises.notes,
})

const bedspaceToBedspaceSummary = (bedspace: Cas3Bedspace): Cas3BedspaceSearchResultBedspaceSummary => ({
  id: bedspace.id,
  reference: bedspace.reference,
  characteristics: bedspace.bedspaceCharacteristics.map(characteristic => ({
    name: characteristic.name,
    description: characteristic.description,
  })),
})
