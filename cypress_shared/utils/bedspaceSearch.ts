import { Characteristic, Room, TemporaryAccommodationPremises } from '../../server/@types/shared'
import { BedspaceSearchFormParameters } from '../../server/@types/ui'

export const characteristicsToSearchAttributes = (premises: TemporaryAccommodationPremises, room: Room) => {
  const occupancyAttributesMap: Record<string, BedspaceSearchFormParameters['occupancyAttribute']> = {
    All: 'all',
    'Shared property': '62a38d3a-4797-4b0f-8681-7befea1035a4',
    'Single occupancy': '454a5ff4-d87a-43f9-8989-135bcc47a635',
  }
  const wheelchairAccessibilityMap: Record<string, string> = {
    'Wheelchair accessible': 'd2f7796a-88e5-4e53-ab6d-dabb145b6a60',
  }

  const premisesOccupancyAttribute = premises.characteristics
    .map((characteristic: Characteristic) => occupancyAttributesMap[characteristic.name])
    .find(attribute => attribute !== undefined)

  const wheelchairAccessibility = room.characteristics
    .map((characteristic: Characteristic) => wheelchairAccessibilityMap[characteristic.name])
    .find(attribute => attribute !== undefined)

  return { premisesOccupancyAttribute, wheelchairAccessibility }
}
