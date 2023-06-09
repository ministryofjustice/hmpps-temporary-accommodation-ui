import { applicationFactory } from '../../../../testutils/factories'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import { yesOrNoResponseWithDetail } from '../../../utils'
import OtherAccommodationOptions from './otherAccommodationOptions'

jest.mock('../../../utils')

const body = { otherOptions: 'yes' as const, otherOptionsDetail: 'Detail' }

describe('OtherAccommodationOptions', () => {
  const application = applicationFactory.build()

  describe('body', () => {
    it('sets the body', () => {
      const page = new OtherAccommodationOptions(body, application)

      expect(page.body).toEqual(body)
    })
  })

  itShouldHavePreviousValue(new OtherAccommodationOptions({}, application), 'crs-submitted')
  itShouldHaveNextValue(new OtherAccommodationOptions({}, application), '')

  describe('errors', () => {
    it('returns an empty object if the other accommodation options fields are populated', () => {
      const page = new OtherAccommodationOptions(body, application)
      expect(page.errors()).toEqual({})
    })

    it('returns an empty object if the other options answer is no', () => {
      const page = new OtherAccommodationOptions({ otherOptions: 'no' }, application)
      expect(page.errors()).toEqual({})
    })

    it('returns an error if the other options answer not populated', () => {
      const page = new OtherAccommodationOptions({ ...body, otherOptions: undefined }, application)
      expect(page.errors()).toEqual({
        otherOptions: 'You must specifiy if other accommodation options have been considered',
      })
    })

    it('returns an error if the other options answer is yes but details are not populated', () => {
      const page = new OtherAccommodationOptions({ ...body, otherOptionsDetail: undefined }, application)
      expect(page.errors()).toEqual({
        otherOptionsDetail: 'You must provide details of other accommodation options considered',
      })
    })
  })

  describe('response', () => {
    it('returns a translated version of the response', () => {
      ;(yesOrNoResponseWithDetail as jest.Mock).mockReturnValue('Response with optional detail')

      const page = new OtherAccommodationOptions(body, application)
      expect(page.response()).toEqual({
        'Have other accommodation options been considered?': 'Response with optional detail',
      })
      expect(yesOrNoResponseWithDetail).toHaveBeenCalledWith('otherOptions', body)
    })
  })
})
