import { PersonRisksUI } from '../../../../@types/ui'
import { applicationFactory, personFactory } from '../../../../testutils/factories'
import { mapApiPersonRisksForUi } from '../../../../utils/utils'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import RoshLevel from './roshLevel'

jest.mock('../../../../utils/utils')

const body = {
  riskToChildren: 'Risk to children detail',
  riskToPublic: 'Risk to public detail',
  riskToKnownAdult: 'Risk to known adult detail',
  riskToStaff: 'Risk to staff detail',
  riskToSelf: 'Risk to self detail',
}
const personRisksUi = { flags: { value: ['Some flag'] } } as PersonRisksUI

describe('RoshLevel', () => {
  const application = applicationFactory.build({
    person: personFactory.build({
      name: 'John Smith',
    }),
  })

  describe('constructor', () => {
    it('sets the body and risk information', () => {
      ;(mapApiPersonRisksForUi as jest.MockedFunction<typeof mapApiPersonRisksForUi>).mockReturnValue(personRisksUi)

      const page = new RoshLevel(body, application)

      expect(page.body).toEqual(body)
      expect(page.risks).toEqual(personRisksUi)

      expect(mapApiPersonRisksForUi).toHaveBeenCalledWith(application.risks)
    })
  })

  itShouldHavePreviousValue(new RoshLevel({}, application), 'substance-misuse')
  itShouldHaveNextValue(new RoshLevel({}, application), 'risk-management-plan')

  describe('errors', () => {
    it('returns an empty object if all fields are populated', () => {
      const page = new RoshLevel(body, application)
      expect(page.errors()).toEqual({})
    })

    it('returns an error if the risk to children field is not populated', () => {
      const page = new RoshLevel({ ...body, riskToChildren: undefined }, application)
      expect(page.errors()).toEqual({
        riskToChildren: 'You must provide details on how risk to children will impact placement',
      })
    })

    it('returns an error if the risk to public field is not populated', () => {
      const page = new RoshLevel({ ...body, riskToPublic: undefined }, application)
      expect(page.errors()).toEqual({
        riskToPublic: 'You must provide details on how risk to public will impact placement',
      })
    })

    it('returns an error if the risk to known adult field is not populated', () => {
      const page = new RoshLevel({ ...body, riskToKnownAdult: undefined }, application)
      expect(page.errors()).toEqual({
        riskToKnownAdult: 'You must provide details on how risk to known adult will impact placement',
      })
    })

    it('returns an error if the risk to staff field is not populated', () => {
      const page = new RoshLevel({ ...body, riskToStaff: undefined }, application)
      expect(page.errors()).toEqual({
        riskToStaff: 'You must provide details on how risk to staff will impact placement',
      })
    })

    it('returns an error if the risk to self field is not populated', () => {
      const page = new RoshLevel({ ...body, riskToSelf: undefined }, application)
      expect(page.errors()).toEqual({
        riskToSelf: 'You must provide details on how risk to self will impact placement',
      })
    })
  })

  describe('response', () => {
    it('returns a translated version of the response', () => {
      const page = new RoshLevel(body, application)
      expect(page.response()).toEqual({
        'How will risk to children impact placement?': 'Risk to children detail',
        'How will risk to public impact placement?': 'Risk to public detail',
        'How will risk to known adult impact placement?': 'Risk to known adult detail',
        'How will risk to staff impact placement?': 'Risk to staff detail',
        'How will risk to self impact placement?': 'Risk to self detail',
      })
    })
  })
})
