import { PersonRisksUI } from '../../../../@types/ui'
import { applicationFactory, personFactory } from '../../../../testutils/factories'
import { mapApiPersonRisksForUi } from '../../../../utils/utils'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import RiskManagementPlan from './riskManagementPlan'

jest.mock('../../../../utils/utils')

const body = {
  victimSafetyPlanning: 'Victim safety planning detail',
  supervision: 'Supervision detail',
  monitoringAndControl: 'Monitoring and control detail',
  interventionAndTreatment: 'Intervention and treatment detail',
}
const personRisksUi = { flags: { value: ['Some flag'] } } as PersonRisksUI

describe('RiskManagementPlan', () => {
  const application = applicationFactory.build({
    person: personFactory.build({
      name: 'John Smith',
    }),
  })

  describe('constructor', () => {
    it('sets the body and risk information', () => {
      ;(mapApiPersonRisksForUi as jest.MockedFunction<typeof mapApiPersonRisksForUi>).mockReturnValue(personRisksUi)

      const page = new RiskManagementPlan(body, application)

      expect(page.body).toEqual(body)
      expect(page.risks).toEqual(personRisksUi)

      expect(mapApiPersonRisksForUi).toHaveBeenCalledWith(application.risks)
    })
  })

  itShouldHavePreviousValue(new RiskManagementPlan({}, application), 'rosh-level')
  itShouldHaveNextValue(new RiskManagementPlan({}, application), '')

  describe('errors', () => {
    it('returns an empty object if all fields are populated', () => {
      const page = new RiskManagementPlan(body, application)
      expect(page.errors()).toEqual({})
    })

    it('returns an error if the victim safety planning field is not populated', () => {
      const page = new RiskManagementPlan({ ...body, victimSafetyPlanning: undefined }, application)
      expect(page.errors()).toEqual({
        victimSafetyPlanning: 'You must provide details of victim safety planning',
      })
    })

    it('returns an error if the supervision field is not populated', () => {
      const page = new RiskManagementPlan({ ...body, supervision: undefined }, application)
      expect(page.errors()).toEqual({
        supervision: 'You must provide details of supervision',
      })
    })

    it('returns an error if the monitoring and control field is not populated', () => {
      const page = new RiskManagementPlan({ ...body, monitoringAndControl: undefined }, application)
      expect(page.errors()).toEqual({
        monitoringAndControl: 'You must provide details of monitoring and control',
      })
    })

    it('returns an error if the risk to staff field is not populated', () => {
      const page = new RiskManagementPlan({ ...body, interventionAndTreatment: undefined }, application)
      expect(page.errors()).toEqual({
        interventionAndTreatment: 'You must provide details of intervention and treatment',
      })
    })
  })

  describe('response', () => {
    it('returns a translated version of the response', () => {
      const page = new RiskManagementPlan(body, application)
      expect(page.response()).toEqual({
        'Victim safety planning': 'Victim safety planning detail',
        Supervision: 'Supervision detail',
        'Monitoring and control': 'Monitoring and control detail',
        'Intervention and treatment': 'Intervention and treatment detail',
      })
    })
  })
})
