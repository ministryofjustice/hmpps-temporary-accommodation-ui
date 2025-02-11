import { Characteristic, Room, TemporaryAccommodationPremises } from '../../server/@types/shared'
import { BedSearchFormParameters } from '../../server/@types/ui'

export const characteristicsToSearchAttributes = (premises: TemporaryAccommodationPremises, room: Room) => {
  const occupancyAttributesMap: Record<string, BedSearchFormParameters['occupancyAttribute']> = {
    All: 'all',
    'Shared property': 'isSharedProperty',
    'Single occupancy': 'isSingleOccupancy',
  }
  const wheelchairAccessibilityMap: Record<string, string> = {
    'Wheelchair accessible': 'isWheelchairAccessible',
  }

  const premisesOccupancyAttribute = premises.characteristics
    .map((characteristic: Characteristic) => occupancyAttributesMap[characteristic.name])
    .find(attribute => attribute !== undefined)

  const wheelchairAccessibility = room.characteristics
    .map((characteristic: Characteristic) => wheelchairAccessibilityMap[characteristic.name])
    .find(attribute => attribute !== undefined)

  return { premisesOccupancyAttribute, wheelchairAccessibility }
}
