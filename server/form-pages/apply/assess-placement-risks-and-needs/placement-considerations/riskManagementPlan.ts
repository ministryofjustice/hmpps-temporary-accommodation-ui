import { TemporaryAccommodationApplication as Application } from '@approved-premises/api'
import type { PersonRisksUI, TaskListErrors } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import { mapApiPersonRisksForUi } from '../../../../utils/utils'

type RiskManagementPlanBody = {
  victimSafetyPlanning: string
  supervision: string
  monitoringAndControl: string
  interventionAndTreatment: string
}

@Page({
  name: 'risk-management-plan',
  bodyProperties: ['victimSafetyPlanning', 'supervision', 'monitoringAndControl', 'interventionAndTreatment'],
})
export default class RiskManagementPlan implements TasklistPage {
  title = 'Risk management plan'

  questions = {
    victimSafetyPlanning: 'Victim safety planning',
    supervision: 'Supervision',
    monitoringAndControl: 'Monitoring and control',
    interventionAndTreatment: 'Intervention and treatment',
  }

  risks: PersonRisksUI

  constructor(
    readonly body: Partial<RiskManagementPlanBody>,
    readonly application: Application,
  ) {
    this.risks = mapApiPersonRisksForUi(application.risks)
  }

  response() {
    return {
      [this.questions.victimSafetyPlanning]: this.body.victimSafetyPlanning,
      [this.questions.supervision]: this.body.supervision,
      [this.questions.monitoringAndControl]: this.body.monitoringAndControl,
      [this.questions.interventionAndTreatment]: this.body.interventionAndTreatment,
    }
  }

  previous() {
    return 'rosh-level'
  }

  next() {
    return ''
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.victimSafetyPlanning) {
      errors.victimSafetyPlanning = 'You must provide details of victim safety planning'
    }

    if (!this.body.supervision) {
      errors.supervision = 'You must provide details of supervision'
    }

    if (!this.body.monitoringAndControl) {
      errors.monitoringAndControl = 'You must provide details of monitoring and control'
    }

    if (!this.body.interventionAndTreatment) {
      errors.interventionAndTreatment = 'You must provide details of intervention and treatment'
    }

    return errors
  }
}
