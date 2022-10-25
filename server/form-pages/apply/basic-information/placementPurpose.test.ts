import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../shared-examples'

import applicationFactory from '../../../testutils/factories/application'

import PlacementPurpose, { placementPurposes } from './placementPurpose'
import { convertKeyValuePairToCheckBoxItems } from '../../../utils/formUtils'

jest.mock('../../../utils/formUtils')

describe('PlacementPurpose', () => {
  const application = applicationFactory.build()

  describe('body', () => {
    it('should strip unknown attributes from the body', () => {
      const page = new PlacementPurpose(
        {
          placementPurposes: ['publicProtection', 'readjust'],
          something: 'else',
        },
        application,
        'previousPage',
      )

      expect(page.body).toEqual({
        placementPurposes: ['publicProtection', 'readjust'],
      })
    })

    it('should strip otherReason unless the placement purpose is "Other reason"', () => {
      const pageWithOtherReason = new PlacementPurpose(
        {
          placementPurposes: ['publicProtection', 'otherReason'],
          otherReason: 'Another reason',
        },
        application,
        'previousPage',
      )

      expect(pageWithOtherReason.body).toEqual({
        placementPurposes: ['publicProtection', 'otherReason'],
        otherReason: 'Another reason',
      })

      const pageWithoutOtherReason = new PlacementPurpose(
        {
          placementPurposes: ['publicProtection'],
          otherReason: 'Another reason',
        },
        application,
        'previousPage',
      )

      expect(pageWithoutOtherReason.body).toEqual({
        placementPurposes: ['publicProtection'],
      })
    })
  })

  describe('when knowReleaseDate is set to yes', () => {
    itShouldHaveNextValue(
      new PlacementPurpose({ placementPurposes: ['publicProtection'] }, application, 'somePage'),
      '',
    )
  })

  describe("previous returns the value passed into the previousPage parameter of the object's constructor", () => {
    itShouldHavePreviousValue(new PlacementPurpose({}, application, 'previousPage'), 'previousPage')
  })

  describe('errors', () => {
    it('should return an empty object if the placement purpose is specified as a reason other than "Other reason"', () => {
      const page = new PlacementPurpose({ placementPurposes: ['publicProtection'] }, application, 'somePage')
      expect(page.errors()).toEqual({})
    })

    it('should return an error if the placementPurpose is "Other reason" and the reason is note given', () => {
      const page = new PlacementPurpose({ placementPurposes: ['otherReason'] }, application, 'somePage')
      expect(page.errors()).toEqual({ placementPurposes: 'You must explain the reason' })
    })
  })

  describe('calls convertKeyValuePairToCheckBoxItems', () => {
    it('should return an empty object if the placement purpose is specified as a reason other than "Other reason"', () => {
      const page = new PlacementPurpose({ placementPurposes: ['publicProtection'] }, application, 'somePage')
      page.items()
      expect(convertKeyValuePairToCheckBoxItems).toHaveBeenCalledWith(placementPurposes, ['publicProtection'])
    })
  })

  it('should return an error if the reason is not populated', () => {
    const page = new PlacementPurpose({}, application, 'somePage')
    expect(page.errors()).toEqual({ placementPurposes: 'You must choose at least one placement purpose' })
  })

  describe('response', () => {
    it('should return a translated version of the response when the user does not know the release date', () => {
      const page = new PlacementPurpose({ placementPurposes: ['drugAlcoholMonitoring'] }, application, 'somePage')

      expect(page.response()).toEqual({
        [page.title]: 'Provide drug or alcohol monitoring',
      })
    })
  })

  describe('items', () => {
    it('it calls convertKeyValuePairToRadioItems', () => {
      const page = new PlacementPurpose({}, application, 'somePage')
      page.items()

      expect(convertKeyValuePairToCheckBoxItems).toHaveBeenCalled()
    })
  })
})
