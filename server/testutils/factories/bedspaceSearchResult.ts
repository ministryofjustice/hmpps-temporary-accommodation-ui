import { Factory } from 'fishery'

import { faker } from '@faker-js/faker'
import type {
  BedSearchResultPremisesSummary,
  BedSearchResultRoomSummary,
  Cas3BedspaceSearchResult,
  Premises,
  Room,
} from '@approved-premises/api'
import bedFactory from './bed'
import overlapFactory from './overlap'
import premisesFactory from './premises'
import roomFactory from './room'

class BedSearchResultFactory extends Factory<Cas3BedspaceSearchResult> {
  /* istanbul ignore next */
  forPremises(premises: Premises) {
    return this.params({
      premises: premisesToPremisesSummary(premises),
    })
  }

  /* istanbul ignore next */
  forBedspace(premises: Premises, room: Room) {
    return this.params({
      premises: premisesToPremisesSummary(premises),
      room: roomToRoomSummary(room),
    })
  }
}

export default BedSearchResultFactory.define(() => {
  const premises = premisesFactory.build()
  const room = roomFactory.build()
  const bed = bedFactory.build()

  return {
    serviceName: 'temporary-accommodation' as const,
    premises: premisesToPremisesSummary(premises),
    room: roomToRoomSummary(room),
    bed: {
      id: bed.id,
      name: bed.name,
    },
    overlaps: overlapFactory.buildList(faker.number.int({ min: 0, max: 5 })),
  }
})

const premisesToPremisesSummary = (premises: Premises): BedSearchResultPremisesSummary => ({
  id: premises.id,
  name: premises.name,
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

const roomToRoomSummary = (room: Room): BedSearchResultRoomSummary => ({
  id: room.id,
  name: room.name,
  characteristics: room.characteristics.map(characteristic => ({
    name: characteristic.name,
    propertyName: characteristic.propertyName,
  })),
})
