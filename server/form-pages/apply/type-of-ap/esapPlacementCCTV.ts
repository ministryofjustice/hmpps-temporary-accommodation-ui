import type { YesOrNo, TaskListErrors } from '@approved-premises/ui'
import type { Application } from '@approved-premises/api'

import TasklistPage from '../../tasklistPage'
import { convertToTitleCase, retrieveQuestionResponseFromApplication } from '../../../utils/utils'
import { convertKeyValuePairToCheckBoxItems } from '../../../utils/formUtils'
import { EsapReasons } from './esapPlacementScreening'

export const cctvHistory = {
  appearance: 'Changed their appearance or clothing to offend',
  networks: 'Built networks within offender groups',
  staffAssualt: 'Physically assaulted staff',
  prisonerAssualt: 'Physically assaulted other people in prison',
  threatsToLife: 'Received credible threats to life',
  communityThreats:
    'Experienced threats from the local community or media intrusion that poses a risk to the individual, other residents or staff ',
} as const

type CCTVHistory = typeof cctvHistory

export default class EsapPlacementCCTV implements TasklistPage {
  name = 'esap-placement-cctv'

  title = 'Enhanced CCTV Provision'

  body: {
    cctvHistory: Array<keyof CCTVHistory>
    cctvIntelligence: YesOrNo
    cctvIntelligenceDetails: string
    cctvNotes: string
  }

  questions = {
    cctvHistory: `Which behaviours has ${this.application.person.name} demonstrated that require enhanced CCTV provision to monitor?`,
    cctvIntelligence: 'Have partnership agencies requested the sharing of intelligence captured via enhanced CCTV?',
    cctvIntelligenceDetails: 'Provide details',
    cctvNotes: `Provide any supporting information about why ${this.application.person.name} requires enhanced CCTV provision`,
  }

  constructor(body: Record<string, unknown>, private readonly application: Application) {
    this.body = {
      cctvHistory: body.cctvHistory as Array<keyof CCTVHistory>,
      cctvIntelligence: body.cctvIntelligence as YesOrNo,
      cctvIntelligenceDetails: body.cctvIntelligenceDetails as string,
      cctvNotes: body.cctvNotes as string,
    }
  }

  previous() {
    const esapReasons = retrieveQuestionResponseFromApplication(
      this.application,
      'type-of-ap',
      'esap-placement-screening',
      'esapReasons',
    ) as Array<keyof EsapReasons>

    if (esapReasons.includes('secreting')) {
      return 'esap-placement-secreting'
    }

    return 'esap-placement-screening'
  }

  next() {
    return ''
  }

  response() {
    return {
      [this.questions.cctvHistory]: this.body.cctvHistory.map(response => cctvHistory[response]),
      [this.questions.cctvIntelligence]: convertToTitleCase(this.body.cctvIntelligence),
      [this.questions.cctvIntelligenceDetails]: this.body.cctvIntelligenceDetails,
      [this.questions.cctvNotes]: this.body.cctvNotes,
    }
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.cctvHistory || !this.body.cctvHistory.length) {
      errors.cctvHistory = `You must specify which behaviours ${this.application.person.name} has demonstrated that require enhanced CCTV provision to monitor`
    }

    if (!this.body.cctvIntelligence) {
      errors.cctvIntelligence =
        'You must specify if partnership agencies requested the sharing of intelligence captured via enhanced CCTV'
    }

    if (this.body.cctvIntelligence === 'yes' && !this.body.cctvIntelligenceDetails) {
      errors.cctvIntelligenceDetails =
        'You must specify the details if partnership agencies have requested the sharing of intelligence captured via enhanced CCTV'
    }

    return errors
  }

  cctvHistoryItems() {
    return convertKeyValuePairToCheckBoxItems(cctvHistory, this.body.cctvHistory)
  }
}
