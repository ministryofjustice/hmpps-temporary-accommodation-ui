import characteristicFactory from '../testutils/factories/characteristic'
import { formatCharacteristics, filterAndSortCharacteristics, filterCharacteristics } from './characteristicUtils'
import { escape } from './viewUtils'

jest.mock('./viewUtils')

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

describe('formatCharacteristics', () => {
  it('returns an HTML formatted, sorted, list of characteristics', () => {
    ;(escape as jest.MockedFunction<typeof escape>).mockImplementation(text => text)

    const characteristic1 = characteristicFactory.build({
      name: 'ABC',
    })

    const characteristic2 = characteristicFactory.build({
      name: 'EFG',
    })

    const characteristic3 = characteristicFactory.build({
      name: 'LMN',
    })

    const output = formatCharacteristics([characteristic2, characteristic3, characteristic1])

    expect(output).toEqual({
      html: '<ul><li>ABC</li><li>EFG</li><li>LMN</li></ul>',
    })

    expect(escape).toHaveBeenCalledWith('ABC')
    expect(escape).toHaveBeenCalledWith('EFG')
    expect(escape).toHaveBeenCalledWith('LMN')
  })

  it('returns an empty string when given an empty list of characteristics', () => {
    expect(formatCharacteristics([])).toEqual({
      text: '',
    })
  })

  it('returns an empty string when given null', () => {
    expect(formatCharacteristics(null)).toEqual({
      text: '',
    })
  })
})
