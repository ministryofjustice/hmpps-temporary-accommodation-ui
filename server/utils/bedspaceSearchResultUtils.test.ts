import { TemporaryAccommodationBedSearchResultOverlap } from '@approved-premises/api'
import {
  bedSearchResultFactory,
  bookingFactory,
  characteristicFactory,
  personFactory,
  premisesFactory,
  roomFactory,
} from '../testutils/factories'
import {
  bedspaceKeyCharacteristics,
  bedspaceOverlapResult,
  premisesKeyCharacteristics,
} from './bedspaceSearchResultUtils'

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

  describe('bedspaceOverlapResult', () => {
    let overLapDays: TemporaryAccommodationBedSearchResultOverlap['days']
    let overlapResult: Omit<TemporaryAccommodationBedSearchResultOverlap, 'name' | 'sex' | 'assesmentId'>

    const createOverLapResult = () => {
      return {
        crn: personFactory.build().crn,
        days: overLapDays,
        roomId: roomFactory.build().id,
        bookingId: bookingFactory.build().id,
      }
    }

    beforeEach(() => {
      overLapDays = 8
      overlapResult = createOverLapResult()
    })

    it('returns object of key/value pairs', () => {
      expect(bedspaceOverlapResult(overlapResult)).toEqual({
        crn: overlapResult.crn,
        overlapDays: '8 days overlap',
        roomId: overlapResult.roomId,
        bookingId: overlapResult.bookingId,
      })
    })

    describe('when overlap by 1 day', () => {
      beforeEach(() => {
        overLapDays = 1
        overlapResult = createOverLapResult()
      })

      it('returns the correct overlap message for single day', () => {
        expect(bedspaceOverlapResult(overlapResult).overlapDays).toEqual('1 day overlap')
      })
    })
  })
})
