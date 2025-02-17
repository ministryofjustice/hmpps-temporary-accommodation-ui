import { FullPerson, RestrictedPerson, TemporaryAccommodationBedSearchResultOverlap } from '@approved-premises/api'
import {
  assessmentFactory,
  bedSearchResultFactory,
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
    let overlapResult: TemporaryAccommodationBedSearchResultOverlap
    let overLapAssessmentId: TemporaryAccommodationBedSearchResultOverlap['assessmentId']
    let person: FullPerson | RestrictedPerson

    const createOverLapResult = () => {
      return {
        crn: person.crn,
        days: overLapDays,
        personType: person.type,
        roomId: roomFactory.build().id,
        bookingId: '123456789',
        assessmentId: overLapAssessmentId,
        name: person.type === 'FullPerson' ? (person as FullPerson).name : 'Limited access offender',
        sex: person.type === 'FullPerson' ? (person as FullPerson).sex : undefined,
        isSexualRisk: false,
      }
    }

    beforeEach(() => {
      overLapDays = 8
      overLapAssessmentId = assessmentFactory.build().id
      person = fullPersonFactory.build()
      overlapResult = createOverLapResult()
    })

    it('returns object of key/value pairs', () => {
      expect(bedspaceOverlapResult(overlapResult)).toEqual({
        crn: overlapResult.crn,
        overlapDays: '8 days overlap',
        personType: 'FullPerson',
        roomId: overlapResult.roomId,
        assessmentId: overlapResult.assessmentId,
        displayName: overlapResult.name,
        referralNameOrCrn: overlapResult.name,
        sex: overlapResult.sex,
      })
    })

    describe('when overlap by 1 day', () => {
      beforeEach(() => {
        overLapDays = 1
        overLapAssessmentId = assessmentFactory.build().id
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
        overLapAssessmentId = assessmentFactory.build().id
        overlapResult = createOverLapResult()
      })

      it('returns object of key/value pairs', () => {
        expect(bedspaceOverlapResult(overlapResult)).toEqual({
          crn: overlapResult.crn,
          overlapDays: '8 days overlap',
          personType: 'RestrictedPerson',
          roomId: overlapResult.roomId,
          referralNameOrCrn: overlapResult.crn,
          assessmentId: overlapResult.assessmentId,
          displayName: 'Limited access offender',
        })
      })
    })

    describe('when offender is a sexual risk', () => {
      beforeEach(() => {
        overLapDays = 8
        person = fullPersonFactory.build()
        overLapAssessmentId = assessmentFactory.build().id
        overlapResult = createOverLapResult()
        overlapResult.isSexualRisk = true
      })

      it('returns object of key/value pairs with sexual risk flag', () => {
        expect(bedspaceOverlapResult(overlapResult)).toEqual({
          crn: overlapResult.crn,
          overlapDays: '8 days overlap',
          personType: 'FullPerson',
          roomId: overlapResult.roomId,
          referralNameOrCrn: overlapResult.name,
          assessmentId: overlapResult.assessmentId,
          displayName: overlapResult.name,
          sex: overlapResult.sex,
          sexualRiskFlag: 'Sexual Risk',
        })
      })
    })

    describe('when no assessment is assigned', () => {
      beforeEach(() => {
        overLapDays = 1
        overLapAssessmentId = undefined
        overlapResult = createOverLapResult()
      })

      it('returns undefined for assessment ID', () => {
        expect(bedspaceOverlapResult(overlapResult).assessmentId).toBeUndefined()
      })
    })
  })
})
