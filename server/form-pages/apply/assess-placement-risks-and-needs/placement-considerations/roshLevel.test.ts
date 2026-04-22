import { PersonRisksUI } from '../../../../@types/ui'
import { applicationFactory, personFactory } from '../../../../testutils/factories'
import { mapApiPersonRisksForUi, sentenceCase } from '../../../../utils/utils'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import RoshLevel from './roshLevel'

jest.mock('../../../../utils/utils')

const body: ConstructorParameters<typeof RoshLevel>[0] = {
  riskToChildren: 'Risk to children detail',
  riskToPublic: 'Risk to public detail',
  riskToKnownAdult: 'Risk to known adult detail',
  riskToStaff: 'Risk to staff detail',
  riskToSelfConcerns: 'yes',
  riskToSelf: 'Risk to self detail',
  safetyPlanCompleted: 'yesAndConsentToShareHasBeenGiven',
}
const personRisksUi = { flags: { value: ['Some flag'] } } as PersonRisksUI

describe('RoshLevel', () => {
  const application = applicationFactory.build({
    person: personFactory.build({
      name: 'John Smith',
    }),
  })

  beforeEach(() => {
    ;(sentenceCase as jest.MockedFunction<typeof sentenceCase>).mockImplementation(
      value => value.charAt(0).toUpperCase() + value.slice(1),
    )
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

    it('does not return an error if risk to self concerns is no and the risk to self field is not populated', () => {
      const page = new RoshLevel({ ...body, riskToSelfConcerns: 'no', riskToSelf: undefined }, application)
      expect(page.errors()).toEqual({})
    })

    it('returns an error if the risk to self concerns field is not populated', () => {
      const page = new RoshLevel({ ...body, riskToSelfConcerns: undefined }, application)
      expect(page.errors()).toEqual({
        riskToSelfConcerns: 'Select yes if there are any current or past concerns about self harm or suicide',
      })
    })

    it('returns an error if the safety plan field is not populated', () => {
      const page = new RoshLevel({ ...body, safetyPlanCompleted: undefined }, application)
      expect(page.errors()).toEqual({
        safetyPlanCompleted: 'Select if a Safety plan has been completed',
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
        'Are there any current or past concerns about self-harm or suicide?': 'Yes',
        'How will risk to self impact placement?': 'Risk to self detail',
        'Has a safety plan been completed?': 'Yes, and consent to share has been given',
      })
    })
  })
})
