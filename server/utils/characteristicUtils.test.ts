import { characteristicFactory } from '../testutils/factories'
import { characteristicToCas3ReferenceData, filterCharacteristics } from './characteristicUtils'

describe('filterCharacteristics', () => {
  it('filters given characteristics', () => {
    const characteristic1 = characteristicFactory.build({
      name: 'ABC',
      modelScope: 'room',
    })

    const characteristic2 = characteristicFactory.build({
      name: 'EFG',
      modelScope: 'room',
    })

    const characteristic3 = characteristicFactory.build({
      name: 'LMN',
      modelScope: 'premises',
    })

    const characteristic4 = characteristicFactory.build({
      name: 'XYZ',
      modelScope: '*',
    })

    const output = filterCharacteristics([characteristic1, characteristic2, characteristic3, characteristic4], 'room')
    expect(output).toEqual([characteristic1, characteristic2, characteristic4])
  })
})

describe('characteristicToCas3ReferenceData', () => {
  it('converts a characteristic to a CAS3 reference data object', () => {
    const characteristic = characteristicFactory.build()

    expect(characteristicToCas3ReferenceData(characteristic)).toEqual({
      id: characteristic.id,
      name: characteristic.propertyName,
      description: characteristic.name,
    })
  })
})
