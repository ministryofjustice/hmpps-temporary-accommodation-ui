import { applicationFactory, personFactory } from '../../../../testutils/factories'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import { yesOrNoResponseWithDetail } from '../../../utils'
import ReligiousOrCulturalNeeds from './religiousOrCulturalNeeds'

jest.mock('../../../utils')

const body = { religiousOrCulturalNeeds: 'yes' as const, religiousOrCulturalNeedsDetail: 'Detail' }

describe('ReligiousOrCulturalNeeds', () => {
  const application = applicationFactory.build({
    person: personFactory.build({
      name: 'John Smith',
    }),
  })

  describe('body', () => {
    it('sets the body', () => {
      const page = new ReligiousOrCulturalNeeds(body, application)

      expect(page.body).toEqual(body)
    })
  })

  itShouldHavePreviousValue(new ReligiousOrCulturalNeeds({}, application), 'property-attributes-or-adaptations')
  itShouldHaveNextValue(new ReligiousOrCulturalNeeds({}, application), '')

  describe('errors', () => {
    it('returns an empty object if the needs field are populated', () => {
      const page = new ReligiousOrCulturalNeeds(body, application)
      expect(page.errors()).toEqual({})
    })

    it('returns an empty object if the needs answer is no', () => {
      const page = new ReligiousOrCulturalNeeds({ religiousOrCulturalNeeds: 'no' }, application)
      expect(page.errors()).toEqual({})
    })

    it('returns an error if the needs answer not populated', () => {
      const page = new ReligiousOrCulturalNeeds({ ...body, religiousOrCulturalNeeds: undefined }, application)
      expect(page.errors()).toEqual({
        religiousOrCulturalNeeds: 'You must specify if John Smith has any religious or cultural needs',
      })
    })

    it('returns an error if the needs answer is yes but details are not populated', () => {
      const page = new ReligiousOrCulturalNeeds({ ...body, religiousOrCulturalNeedsDetail: undefined }, application)
      expect(page.errors()).toEqual({
        religiousOrCulturalNeedsDetail: "You must provide details of John Smith's religious or cultural needs",
      })
    })
  })

  describe('response', () => {
    it('returns a translated version of the response', () => {
      ;(yesOrNoResponseWithDetail as jest.Mock).mockReturnValue('Response with optional detail')

      const page = new ReligiousOrCulturalNeeds(body, application)
      expect(page.response()).toEqual({
        'Does this person have any religious or cultural needs?': 'Response with optional detail',
      })
      expect(yesOrNoResponseWithDetail).toHaveBeenCalledWith('religiousOrCulturalNeeds', body)
    })
  })
})
