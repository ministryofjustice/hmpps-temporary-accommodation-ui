import { bedSearchResultFactory, characteristicFactory, premisesFactory, roomFactory } from '../testutils/factories'
import { bedspaceKeyCharacteristics, premisesKeyCharacteristics } from './bedspaceSearchResultUtils'

describe('BedspaceSearchResultUtils', () => {
  describe('bedspaceKeyCharacteristics', () => {
    it('returns a sorted list of the characteristic names for the bedspace', () => {
      const premises = premisesFactory.build({
        characteristics: [
          characteristicFactory.build({
            name: 'Women only',
          }),
          characteristicFactory.build({
            name: 'Shared property',
          }),
          characteristicFactory.build({
            name: 'Shared entrance',
          }),
        ],
      })

      const searchResult = bedSearchResultFactory.forPremises(premises).build()

      expect(premisesKeyCharacteristics(searchResult)).toEqual(['Shared entrance', 'Shared property', 'Women only'])
    })
  })

  describe('bedspaceKeyCharacteristics', () => {
    it('returns a sorted list of the characteristic names for the bedspace', () => {
      const premises = premisesFactory.build()
      const room = roomFactory.build({
        characteristics: [
          characteristicFactory.build({
            name: 'Wheelchair accessible',
          }),
          characteristicFactory.build({
            name: 'Shared bathroom',
          }),
          characteristicFactory.build({
            name: 'Shared kitchen',
          }),
        ],
      })

      const searchResult = bedSearchResultFactory.forBedspace(premises, room).build()

      expect(bedspaceKeyCharacteristics(searchResult)).toEqual([
        'Shared bathroom',
        'Shared kitchen',
        'Wheelchair accessible',
      ])
    })
  })
})
