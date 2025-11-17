import { Cas3ReferenceData, Characteristic } from '../@types/shared'

export const filterCharacteristics = (
  characteristics: Array<Characteristic>,
  scope: 'room' | 'premises',
): Array<Characteristic> => {
  return characteristics.filter(
    characteristic => characteristic.modelScope === scope || characteristic.modelScope === '*',
  )
}

// TODO -- ENABLE_CAS3V2_API cleanup: remove the following casting utility and all usages
export const characteristicToCas3ReferenceData = (characteristic: Characteristic): Cas3ReferenceData => ({
  id: characteristic.id,
  description: characteristic.name,
  name: characteristic.propertyName,
})
