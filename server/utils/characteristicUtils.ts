import { Characteristic } from '@approved-premises/api'

export const filterCharacteristics = (
  characteristics: Array<Characteristic>,
  scope: 'room' | 'premises',
): Array<Characteristic> => {
  return characteristics.filter(
    characteristic => characteristic.modelScope === scope || characteristic.modelScope === '*',
  )
}
