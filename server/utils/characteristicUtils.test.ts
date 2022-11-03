import characteristicFactory from '../testutils/factories/characteristic'
import { filterAndSortCharacteristics } from './characteristicUtils'

describe('filterAndSortCharacteristics', () => {
  it('filters and sorts given characteristics', () => {
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

    const output = filterAndSortCharacteristics(
      [characteristic2, characteristic4, characteristic3, characteristic1],
      'room',
    )
    expect(output).toEqual([characteristic1, characteristic2, characteristic4])
  })
})

