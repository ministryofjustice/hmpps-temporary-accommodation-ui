import { FullPerson, RestrictedPerson, TemporaryAccommodationBedSearchResultOverlap } from '@approved-premises/api'
import {
  bedSearchResultFactory,
  bookingFactory,
  characteristicFactory,
  premisesFactory,
  restrictedPersonFactory,
  roomFactory,
} from '../testutils/factories'
import {
  bedspaceKeyCharacteristics,
  bedspaceOverlapResult,
  premisesKeyCharacteristics,
} from './bedspaceSearchResultUtils'
import { fullPersonFactory } from '../testutils/factories/person'

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
    let overlapResult: Omit<TemporaryAccommodationBedSearchResultOverlap, 'sex' | 'assesmentId'>
    let person: FullPerson | RestrictedPerson

    const createOverLapResult = () => {
      return {
        crn: person.crn,
        days: overLapDays,
        personType: person.type,
        roomId: roomFactory.build().id,
        bookingId: bookingFactory.build().id,
        name: person.type === 'FullPerson' ? (person as FullPerson).name : 'Limited access offender',
      }
    }

    beforeEach(() => {
      overLapDays = 8
      person = fullPersonFactory.build()
      overlapResult = createOverLapResult()
    })

    it('returns object of key/value pairs', () => {
      expect(bedspaceOverlapResult(overlapResult)).toEqual({
        crn: overlapResult.crn,
        overlapDays: '8 days overlap',
        personType: 'FullPerson',
        roomId: overlapResult.roomId,
        bookingId: overlapResult.bookingId,
        displayName: overlapResult.name,
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

    describe('when offender is "Limited access offender', () => {
      beforeEach(() => {
        overLapDays = 8
        person = restrictedPersonFactory.build()
        overlapResult = createOverLapResult()
      })

      it('returns object of key/value pairs', () => {
        expect(bedspaceOverlapResult(overlapResult)).toEqual({
          crn: overlapResult.crn,
          overlapDays: '8 days overlap',
          personType: 'RestrictedPerson',
          roomId: overlapResult.roomId,
          bookingId: overlapResult.bookingId,
          displayName: 'Limited access offender',
        })
      })
    })
  })
})
