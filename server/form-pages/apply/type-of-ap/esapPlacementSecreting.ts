import type { ApprovedPremisesApplication as Application } from '@approved-premises/api'
import type { YesOrNo, TaskListErrors } from '@approved-premises/ui'

import TasklistPage from '../../tasklistPage'
import { convertToTitleCase, retrieveQuestionResponseFromApplication } from '../../../utils/utils'
import { convertKeyValuePairToCheckBoxItems } from '../../../utils/formUtils'
import { EsapReasons } from './esapPlacementScreening'

export const secretingHistory = {
  radicalisationLiterature: 'Literature and materials supporting radicalisation ideals',
  hateCrimeLiterature: 'Offence related literature indicative of hate crimes or beliefs',
  csaLiterature: 'Literature and/or items of relevance to child sexual abuse or exploitation',
  drugs: 'Drugs and drug paraphernalia indicative of dealing drugs',
  weapons: 'Weapons, actual or makeshift',
  fire: 'Fire-setting or explosive materials',
  electronicItems: 'Electronic items of significance to the individuals offending profile',
} as const

type SecretingHistory = typeof secretingHistory

export default class EsapPlacementSecreting implements TasklistPage {
  name = 'esap-placement-secreting'

  title = 'Enhanced room searches using body worn technology'

  body: {
    secretingHistory: Array<keyof SecretingHistory>
    secretingIntelligence: YesOrNo
    secretingIntelligenceDetails: string
    secretingNotes: string
  }

  questions = {
    secretingHistory: `Which items does ${this.application.person.name} have a history of secreting?`,
    secretingIntelligence:
      'Have partnership agencies requested the sharing of intelligence captured via body worn technology?',
    secretingIntelligenceDetails: 'Provide details',
    secretingNotes: `Provide any supporting information about why ${this.application.person.name} requires enhanced room searches`,
  }

  constructor(body: Record<string, unknown>, private readonly application: Application) {
    this.body = {
      secretingHistory: body.secretingHistory as Array<keyof SecretingHistory>,
      secretingIntelligence: body.secretingIntelligence as YesOrNo,
      secretingIntelligenceDetails: body.secretingIntelligenceDetails as string,
      secretingNotes: body.secretingNotes as string,
    }
  }

  previous() {
    return 'esap-placement-screening'
  }

  next() {
    const esapReasons = retrieveQuestionResponseFromApplication(
      this.application,
      'type-of-ap',
      'esap-placement-screening',
      'esapReasons',
    ) as Array<keyof EsapReasons>

    if (esapReasons.includes('cctv')) {
      return 'esap-placement-cctv'
    }

    return ''
  }

  response() {
    return {
      [this.questions.secretingHistory]: this.body.secretingHistory.map(response => secretingHistory[response]),
      [this.questions.secretingIntelligence]: convertToTitleCase(this.body.secretingIntelligence),
      [this.questions.secretingIntelligenceDetails]: this.body.secretingIntelligenceDetails,
      [this.questions.secretingNotes]: this.body.secretingNotes,
    }
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.secretingHistory || !this.body.secretingHistory.length) {
      errors.secretingHistory = `You must specify what items ${this.application.person.name} has a history of secreting`
    }

    if (!this.body.secretingIntelligence) {
      errors.secretingIntelligence =
        'You must specify if partnership agencies requested the sharing of intelligence captured via body worn technology'
    }

    if (this.body.secretingIntelligence === 'yes' && !this.body.secretingIntelligenceDetails) {
      errors.secretingIntelligenceDetails =
        'You must specify the details if partnership agencies have requested the sharing of intelligence captured via body worn technology'
    }

    return errors
  }

  secretingHistoryItems() {
    return convertKeyValuePairToCheckBoxItems(secretingHistory, this.body.secretingHistory)
  }
}
