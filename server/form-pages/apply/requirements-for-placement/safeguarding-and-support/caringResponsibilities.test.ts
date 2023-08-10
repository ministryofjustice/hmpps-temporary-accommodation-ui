import { applicationFactory, personFactory } from '../../../../testutils/factories'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import { yesOrNoResponseWithDetail } from '../../../utils'
import CaringResponsibilities from './caringResponsibilities'

jest.mock('../../../utils')

const body = { caringResponsibilities: 'yes' as const, caringResponsibilitiesDetail: 'Detail' }

describe('CaringResponsibilities', () => {
  const application = applicationFactory.build({
    person: personFactory.build({
      name: 'John Smith',
    }),
  })

  describe('body', () => {
    it('sets the body', () => {
      const page = new CaringResponsibilities(body, application)

      expect(page.body).toEqual(body)
    })
  })

  itShouldHavePreviousValue(new CaringResponsibilities({}, application), 'local-connections')
  itShouldHaveNextValue(new CaringResponsibilities({}, application), '')

  describe('errors', () => {
    it('returns an empty object if the caring responsibilities fields are populated', () => {
      const page = new CaringResponsibilities(body, application)
      expect(page.errors()).toEqual({})
    })

    it('returns an empty object if the caring responsibilities answer is no', () => {
      const page = new CaringResponsibilities({ caringResponsibilities: 'no' }, application)
      expect(page.errors()).toEqual({})
    })

    it('returns an error if the caring responsibilities answer not populated', () => {
      const page = new CaringResponsibilities({ ...body, caringResponsibilities: undefined }, application)
      expect(page.errors()).toEqual({
        caringResponsibilities: `You must specify if John Smith has any caring responsibilities`,
      })
    })

    it('returns an error if the caring responsibilities answer is yes but details are not populated', () => {
      const page = new CaringResponsibilities({ ...body, caringResponsibilitiesDetail: undefined }, application)
      expect(page.errors()).toEqual({
        caringResponsibilitiesDetail: 'You must provide details of any caring responsibilities',
      })
    })
  })

  describe('response', () => {
    it('returns a translated version of the response', () => {
      ;(yesOrNoResponseWithDetail as jest.Mock).mockReturnValue('Response with optional detail')

      const page = new CaringResponsibilities(body, application)
      expect(page.response()).toEqual({
        'Does this person have any caring responsibilities?': 'Response with optional detail',
      })
      expect(yesOrNoResponseWithDetail).toHaveBeenCalledWith('caringResponsibilities', body)
    })
  })
})
