import { Cas3v2BedspaceSearchResultOverlap, FullPerson, RestrictedPerson } from '@approved-premises/api'
import {
  assessmentFactory,
  cas3BedspaceCharacteristicsFactory,
  cas3BedspaceFactory,
  cas3PremisesCharacteristicsFactory,
  cas3PremisesFactory,
  cas3v2BedspaceSearchResultFactory,
  cas3v2BedspaceSearchResultOverlapFactory,
  restrictedPersonFactory,
} from '../testutils/factories'
import {
  bedspaceKeyCharacteristics,
  bedspaceOverlapResult,
  premisesKeyCharacteristics,
} from './bedspaceSearchResultUtils'
import { fullPersonFactory } from '../testutils/factories/person'

describe('BedspaceSearchResultUtils', () => {
  describe('premisesKeyCharacteristics', () => {
    it('returns a sorted list of the characteristic descriptions for the premises', () => {
      const premises = cas3PremisesFactory.build({
        premisesCharacteristics: [
          cas3PremisesCharacteristicsFactory.build({
            description: 'Women only',
          }),
          cas3PremisesCharacteristicsFactory.build({
            description: 'Shared property',
          }),
          cas3PremisesCharacteristicsFactory.build({
            description: 'Shared entrance',
          }),
        ],
      })

      const searchResult = cas3v2BedspaceSearchResultFactory.forPremises(premises).build()

      expect(premisesKeyCharacteristics(searchResult)).toEqual(['Shared entrance', 'Shared property', 'Women only'])
    })
  })

  describe('bedspaceKeyCharacteristics', () => {
    it('returns a sorted list of the characteristic descriptions for the bedspace', () => {
      const premises = cas3PremisesFactory.build()
      const bedspace = cas3BedspaceFactory.build({
        bedspaceCharacteristics: [
          cas3BedspaceCharacteristicsFactory.build({
            description: 'Wheelchair accessible',
          }),
          cas3BedspaceCharacteristicsFactory.build({
            description: 'Shared bathroom',
          }),
          cas3BedspaceCharacteristicsFactory.build({
            description: 'Shared kitchen',
          }),
        ],
      })

      const searchResult = cas3v2BedspaceSearchResultFactory.forBedspace(premises, bedspace).build()

      expect(bedspaceKeyCharacteristics(searchResult)).toEqual([
        'Shared bathroom',
        'Shared kitchen',
        'Wheelchair accessible',
      ])
    })
  })

  describe('bedspaceOverlapResult', () => {
    let overLapDays: Cas3v2BedspaceSearchResultOverlap['days']
    let overlapResult: Cas3v2BedspaceSearchResultOverlap
    let overLapAssessmentId: Cas3v2BedspaceSearchResultOverlap['assessmentId']
    let person: FullPerson | RestrictedPerson

    const createOverLapResult = () =>
      cas3v2BedspaceSearchResultOverlapFactory.build({
        crn: person.crn,
        days: overLapDays,
        personType: person.type,
        bedspaceId: cas3BedspaceFactory.build().id,
        bookingId: '123456789',
        assessmentId: overLapAssessmentId,
        name: person.type === 'FullPerson' ? (person as FullPerson).name : 'Limited access offender',
        sex: person.type === 'FullPerson' ? (person as FullPerson).sex : undefined,
        isSexualRisk: false,
      })

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
        bedspaceId: overlapResult.bedspaceId,
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
          bedspaceId: overlapResult.bedspaceId,
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
          bedspaceId: overlapResult.bedspaceId,
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
