import { bedSearchResultFactory, characteristicFactory, premisesFactory, roomFactory } from '../testutils/factories'
import {
  BedspaceSearchResultUtils,
  bedspaceKeyCharacteristics,
  premisesKeyCharacteristics,
} from './bedspaceSearchResultUtils'

describe('BedspaceSearchResultUtils', () => {
  describe('resultTableRows', () => {
    it('returns a govuk table row for each bed', () => {
      const bedSeachResults = bedSearchResultFactory.buildList(2)
      const firstBedResult = bedSeachResults[0]
      const secondBedResult = bedSeachResults[1]

      const tableRows = BedspaceSearchResultUtils.resultTableRows(bedSeachResults)

      expect(tableRows[0]).toEqual([
        { text: firstBedResult.room.name },
        { text: `${firstBedResult.premises.addressLine1}, ${firstBedResult.premises.postcode}` },
        { text: firstBedResult.premises.bedCount.toString() },
        {
          html: `<a href="/properties/${firstBedResult.premises.id}/bedspaces/${firstBedResult.room.id}">View<span class="govuk-visually-hidden"> bedspace for ${firstBedResult.premises.addressLine1}</span></a>`,
        },
      ])

      expect(tableRows[1]).toEqual([
        { text: secondBedResult.room.name },
        { text: `${secondBedResult.premises.addressLine1}, ${secondBedResult.premises.postcode}` },
        { text: secondBedResult.premises.bedCount.toString() },
        {
          html: `<a href="/properties/${secondBedResult.premises.id}/bedspaces/${secondBedResult.room.id}">View<span class="govuk-visually-hidden"> bedspace for ${secondBedResult.premises.addressLine1}</span></a>`,
        },
      ])
    })
  })

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
