import { applicationFactory, personFactory } from '../../../../testutils/factories'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import { yesOrNoResponseWithDetail } from '../../../utils'
import PropertyAttributesOrAdaptations from './propertyAttributesOrAdaptations'

jest.mock('../../../utils')

const body = { propertyAttributesOrAdaptations: 'yes' as const, propertyAttributesOrAdaptationsDetail: 'Detail' }

describe('PropertyAttributesOrAdaptations', () => {
  const application = applicationFactory.build({
    person: personFactory.build({
      name: 'John Smith',
    }),
  })

  describe('body', () => {
    it('sets the body', () => {
      const page = new PropertyAttributesOrAdaptations(body, application)

      expect(page.body).toEqual(body)
    })
  })

  itShouldHavePreviousValue(new PropertyAttributesOrAdaptations({}, application), 'needs')
  itShouldHaveNextValue(new PropertyAttributesOrAdaptations({}, application), 'religious-or-cultural-needs')

  describe('errors', () => {
    it('returns an empty object if the property fields are populated', () => {
      const page = new PropertyAttributesOrAdaptations(body, application)
      expect(page.errors()).toEqual({})
    })

    it('returns an empty object if the property answer is no', () => {
      const page = new PropertyAttributesOrAdaptations({ propertyAttributesOrAdaptations: 'no' }, application)
      expect(page.errors()).toEqual({})
    })

    it('returns an error if the property answer not populated', () => {
      const page = new PropertyAttributesOrAdaptations(
        { ...body, propertyAttributesOrAdaptations: undefined },
        application,
      )
      expect(page.errors()).toEqual({
        propertyAttributesOrAdaptations:
          'You must specify if John Smith requires a property with specific attributes or adaptations',
      })
    })

    it('returns an error if the property answer is yes but details are not populated', () => {
      const page = new PropertyAttributesOrAdaptations(
        { ...body, propertyAttributesOrAdaptationsDetail: undefined },
        application,
      )
      expect(page.errors()).toEqual({
        propertyAttributesOrAdaptationsDetail: 'You must provide details of what is required',
      })
    })
  })

  describe('response', () => {
    it('returns a translated version of the response', () => {
      ;(yesOrNoResponseWithDetail as jest.Mock).mockReturnValue('Response with optional detail')

      const page = new PropertyAttributesOrAdaptations(body, application)
      expect(page.response()).toEqual({
        'Will this person require a property with specific attributes or adaptations?': 'Response with optional detail',
      })
      expect(yesOrNoResponseWithDetail).toHaveBeenCalledWith('propertyAttributesOrAdaptations', body)
    })
  })
})
