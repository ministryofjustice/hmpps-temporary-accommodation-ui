import { Characteristic } from '../@types/shared'
import { SummaryListItem } from '../@types/ui'
import { escape } from './viewUtils'

export const filterAndSortCharacteristics = (
  characteristics: Array<Characteristic>,
  scope: 'room' | 'premises',
): Array<Characteristic> => {
  return characteristics
    .filter(characteristic => characteristic.modelScope === scope || characteristic.modelScope === '*')
    .sort((a, b) => a.name.localeCompare(b.name))
}

export const filterCharacteristics = (
  characteristics: Array<Characteristic>,
  scope: 'room' | 'premises',
): Array<Characteristic> => {
  return characteristics.filter(
    characteristic => characteristic.modelScope === scope || characteristic.modelScope === '*',
  )
}

export const formatCharacteristics = (characteristics: Array<Characteristic>): SummaryListItem['value'] => {
  const characteristicNames = (characteristics || [])
    .map(characteristic => characteristic.name)
    .sort((a, b) => a.localeCompare(b))
    .map(name => escape(name))

  return characteristicNames.length > 0
    ? { html: `<ul><li>${characteristicNames.join('</li><li>')}</li></ul>` }
    : { text: '' }
}
