import { Factory } from 'fishery'

import { faker } from '@faker-js/faker'
import type {
  BedSearchResultPremisesSummary,
  BedSearchResultRoomSummary,
  Cas3Bedspace,
  Cas3BedspaceSearchResult,
  Cas3Premises,
} from '@approved-premises/api'
import bedFactory from './bed'
import overlapFactory from './overlap'
import cas3BedspaceFactory from './cas3Bedspace'
import cas3PremisesFactory from './cas3Premises'

class BedSearchResultFactory extends Factory<Cas3BedspaceSearchResult> {
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
      room: bedspaceToBedspaceSummary(bedspace),
      bed: {
        id: bedspace.id,
        name: bedspace.reference,
      },
    })
  }
}

export default BedSearchResultFactory.define(() => {
  const premises = cas3PremisesFactory.build()
  const bedspace = cas3BedspaceFactory.build({ status: 'online' })
  const bed = bedFactory.build()

  return {
    serviceName: 'temporary-accommodation' as const,
    premises: premisesToPremisesSummary(premises),
    room: bedspaceToBedspaceSummary(bedspace),
    bed: {
      id: bed.id,
      name: bed.name,
    },
    overlaps: overlapFactory.buildList(faker.number.int({ min: 0, max: 5 })),
  }
})

const premisesToPremisesSummary = (premises: Cas3Premises): BedSearchResultPremisesSummary => ({
  id: premises.id,
  name: '',
  addressLine1: premises.addressLine1,
  addressLine2: premises.addressLine2,
  town: premises.town,
  postcode: premises.postcode,
  characteristics: premises.characteristics.map(characteristic => ({
    name: characteristic.name,
    propertyName: characteristic.propertyName,
  })),
  bedCount: faker.number.int({ min: 1, max: 10 }),
  notes: premises.notes,
})

const bedspaceToBedspaceSummary = (bedspace: Cas3Bedspace): BedSearchResultRoomSummary => ({
  id: bedspace.id,
  name: bedspace.reference,
  characteristics: bedspace.characteristics.map(characteristic => ({
    name: characteristic.name,
    propertyName: characteristic.propertyName,
  })),
})
