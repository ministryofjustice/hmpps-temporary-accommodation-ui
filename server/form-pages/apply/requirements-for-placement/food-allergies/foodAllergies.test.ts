import { applicationFactory, personFactory } from '../../../../testutils/factories'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import { yesNoOrDontKnowResponseWithDetail } from '../../../utils'
import FoodAllergies from './foodAllergies'

jest.mock('../../../utils')

const body = { foodAllergies: 'yes' as const, foodAllergiesDetail: 'Detail' }

describe('FoodAllergies', () => {
  const application = applicationFactory.build({
    person: personFactory.build({
      name: 'John Smith',
    }),
  })

  describe('body', () => {
    it('sets the body', () => {
      const page = new FoodAllergies(body, application)

      expect(page.body).toEqual(body)
    })
  })

  itShouldHavePreviousValue(new FoodAllergies({}, application), 'dashboard')
  itShouldHaveNextValue(new FoodAllergies({}, application), '')

  describe('errors', () => {
    it('returns an empty object if the food allergies fields are populated', () => {
      const page = new FoodAllergies(body, application)
      expect(page.errors()).toEqual({})
    })

    it('returns an empty object if the food allergies answer is no', () => {
      const page = new FoodAllergies({ foodAllergies: 'no' }, application)
      expect(page.errors()).toEqual({})
    })

    it('returns an empty object if the food allergies answer is iDontKnow', () => {
      const page = new FoodAllergies({ foodAllergies: 'iDontKnow' }, application)
      expect(page.errors()).toEqual({})
    })

    it('returns an error if the food allergies answer not populated', () => {
      const page = new FoodAllergies({ ...body, foodAllergies: undefined }, application)
      expect(page.errors()).toEqual({
        foodAllergies: 'You must specify if John Smith has any food allergies or dietary requirements',
      })
    })

    it('returns an error if the food allergies answer is yes but details are not populated', () => {
      const page = new FoodAllergies({ ...body, foodAllergiesDetail: undefined }, application)
      expect(page.errors()).toEqual({
        foodAllergiesDetail: 'You must provide details of any food allergies or dietary requirements',
      })
    })
  })

  describe('response', () => {
    it('returns a translated version of the response', () => {
      ;(yesNoOrDontKnowResponseWithDetail as jest.Mock).mockReturnValue('Response with optional detail')

      const page = new FoodAllergies(body, application)
      expect(page.response()).toEqual({
        'Does the person have any food allergies or dietary requirements?': 'Response with optional detail',
      })
      expect(yesNoOrDontKnowResponseWithDetail).toHaveBeenCalledWith('foodAllergies', body)
    })
  })
})
