import { applicationFactory, personFactory } from '../../../../testutils/factories'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import { yesOrNoResponseWithDetail } from '../../../utils'
import PropertySharing from './propertySharing'

jest.mock('../../../utils')

const body = { propertySharing: 'yes' as const, propertySharingDetail: 'Detail' }

describe('PropertySharing', () => {
  const application = applicationFactory.build({
    person: personFactory.build({
      name: 'John Smith',
    }),
  })

  describe('body', () => {
    it('sets the body', () => {
      const page = new PropertySharing(body, application)

      expect(page.body).toEqual(body)
    })
  })

  itShouldHavePreviousValue(new PropertySharing({}, application), 'dashboard')
  itShouldHaveNextValue(new PropertySharing({}, application), 'food-allergies')

  describe('errors', () => {
    it('returns an empty object if the property sharing fields are populated', () => {
      const page = new PropertySharing(body, application)
      expect(page.errors()).toEqual({})
    })

    it('returns an empty object if the property sharing answer is no', () => {
      const page = new PropertySharing({ propertySharing: 'no' }, application)
      expect(page.errors()).toEqual({})
    })

    it('returns an error if the property sharing answer not populated', () => {
      const page = new PropertySharing({ ...body, propertySharing: undefined }, application)
      expect(page.errors()).toEqual({
        propertySharing: 'You must specify if John Smith would be able to share accommodation with others',
      })
    })

    it('returns an error if the property sharing answer is yes but details are not populated', () => {
      const page = new PropertySharing({ ...body, propertySharingDetail: undefined }, application)
      expect(page.errors()).toEqual({
        propertySharingDetail:
          'You must provide details of how you will manage risk if John Smith is placed in shared accommodation',
      })
    })
  })

  describe('response', () => {
    it('returns a translated version of the response', () => {
      ;(yesOrNoResponseWithDetail as jest.Mock).mockReturnValue('Response with optional detail')

      const page = new PropertySharing(body, application)
      expect(page.response()).toEqual({
        'Would John Smith be able to share accommodation with others?': 'Response with optional detail',
      })
      expect(yesOrNoResponseWithDetail).toHaveBeenCalledWith('propertySharing', body)
    })
  })
})
