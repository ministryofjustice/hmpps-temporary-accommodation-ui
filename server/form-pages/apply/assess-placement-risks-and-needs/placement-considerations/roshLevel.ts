import { TemporaryAccommodationApplication as Application } from '@approved-premises/api'
import type { PersonRisksUI, TaskListErrors, YesOrNo } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import { mapApiPersonRisksForUi, sentenceCase } from '../../../../utils/utils'

type SafetyPlanCompleted = 'yesAndConsentToShareHasBeenGiven' | 'yesButNoConsentToShare' | 'noSafetyPlan'

const safetyPlanCompletedResponses: Record<SafetyPlanCompleted, string> = {
  yesAndConsentToShareHasBeenGiven: 'Yes, and consent to share has been given',
  yesButNoConsentToShare: 'Yes, but no consent to share',
  noSafetyPlan: 'No safety plan',
}

type RoshLevelBody = {
  riskToChildren: string
  riskToPublic: string
  riskToKnownAdult: string
  riskToStaff: string
  riskToSelfConcerns: YesOrNo
  riskToSelf: string
  safetyPlanCompleted: SafetyPlanCompleted
}

@Page({
  name: 'rosh-level',
  bodyProperties: [
    'riskToChildren',
    'riskToPublic',
    'riskToKnownAdult',
    'riskToStaff',
    'riskToSelfConcerns',
    'riskToSelf',
    'safetyPlanCompleted',
  ],
})
export default class RoshLevel implements TasklistPage {
  title = 'RoSH level'

  htmlDocumentTitle = this.title

  risks: PersonRisksUI

  questions = {
    riskToSelfConcerns: 'Are there any current or past concerns about self-harm or suicide?',
    safetyPlanCompleted: 'Has a safety plan been completed?',
  }

  safetyPlanTemplateUrl = 'https://equip-portal.equip.service.justice.gov.uk/'

  constructor(
    readonly body: Partial<RoshLevelBody>,
    readonly application: Application,
  ) {
    this.risks = mapApiPersonRisksForUi(application.risks)
  }

  response() {
    return {
      'How will risk to children impact placement?': this.body.riskToChildren,
      'How will risk to public impact placement?': this.body.riskToPublic,
      'How will risk to known adult impact placement?': this.body.riskToKnownAdult,
      'How will risk to staff impact placement?': this.body.riskToStaff,
      [this.questions.riskToSelfConcerns]: sentenceCase(this.body.riskToSelfConcerns as string),
      'How will risk to self impact placement?': this.body.riskToSelf,
      [this.questions.safetyPlanCompleted]:
        safetyPlanCompletedResponses[this.body.safetyPlanCompleted as SafetyPlanCompleted],
    }
  }

  previous() {
    return 'substance-misuse'
  }

  next() {
    return 'risk-management-plan'
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.riskToChildren) {
      errors.riskToChildren = 'You must provide details on how risk to children will impact placement'
    }

    if (!this.body.riskToPublic) {
      errors.riskToPublic = 'You must provide details on how risk to public will impact placement'
    }

    if (!this.body.riskToKnownAdult) {
      errors.riskToKnownAdult = 'You must provide details on how risk to known adult will impact placement'
    }

    if (!this.body.riskToStaff) {
      errors.riskToStaff = 'You must provide details on how risk to staff will impact placement'
    }

    if (!this.body.riskToSelfConcerns) {
      errors.riskToSelfConcerns = 'Select yes if there are any current or past concerns about self harm or suicide'
    }

    if (this.body.riskToSelfConcerns === 'yes' && !this.body.riskToSelf) {
      errors.riskToSelf = 'You must provide details on how risk to self will impact placement'
    }

    if (!this.body.safetyPlanCompleted) {
      errors.safetyPlanCompleted = 'Select if a Safety plan has been completed'
    }

    return errors
  }
}
