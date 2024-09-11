import { BedSearchAttributes, Characteristic, TemporaryAccommodationPremises } from '../../server/@types/shared'

export const characteristicsToSearchAttributes = (
  premises: TemporaryAccommodationPremises,
): Array<BedSearchAttributes> => {
  const characteristicsToSearchAttributesMap: Record<string, BedSearchAttributes> = {
    'Shared property': 'sharedProperty',
    'Single occupancy': 'singleOccupancy',
  }

  return premises.characteristics
    .map((characteristic: Characteristic) => characteristicsToSearchAttributesMap[characteristic.name])
    .filter(Boolean)
}
