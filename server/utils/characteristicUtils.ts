import { Characteristic } from '../@types/shared'

export const filterAndSortCharacteristics = (
  characteristics: Array<Characteristic>,
  scope: 'room' | 'premises',
): Array<Characteristic> => {
  return characteristics
    .filter(characteristic => characteristic.modelScope === scope || characteristic.modelScope === '*')
    .sort((a, b) => a.name.localeCompare(b.name))
}

