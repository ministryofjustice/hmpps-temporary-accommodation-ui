import type { ApprovedPremisesApplication as Application } from '@approved-premises/api'
import type { TaskListErrors } from '@approved-premises/ui'

import TasklistPage from '../../tasklistPage'
import { convertKeyValuePairToCheckBoxItems } from '../../../utils/formUtils'

export const esapReasons = {
  secreting:
    'History of secreting items relevant to risk and re-offending in their room - requires enhanced room search through the use of body worn technology',
  cctv: 'History of engaging in behaviours which are most effectively monitored via enhanced CCTV technology - requires enhanced CCTV provision',
} as const

export const esapFactors = {
  neurodiverse: 'A diagnosis of autism or neurodiverse traits',
  complexPersonality:
    'A complex personality presentation which has created challenges in the prison and where an AP PIPE is deemed unsuitable',
  nonNsd:
    'A non-NSD case where enhanced national standards are required to manage the risks posed and thought to be beneficial to risk reduction',
  careAndSeperation: 'Individual has spent time in a Care and Separation Unit in the last 24 months',
  unlock: 'Individual has required a 2/3 prison officer unlock in the last 12 months.',
  corrupter: 'Individual has been identified as a known/suspected corrupter of staff',
}

export type EsapReasons = typeof esapReasons
export type EsapFactors = typeof esapFactors

export default class EsapPlacementScreening implements TasklistPage {
  name = 'esap-placement-screening'

  title = `Why does ${this.application.person.name} require an enhanced security placement?`

  questions = {
    esapReasons: this.title,
    esapFactors: 'Do any of the following factors also apply?',
  }

  body: { esapReasons: Array<keyof EsapReasons>; esapFactors: Array<keyof EsapFactors> }

  constructor(body: Record<string, unknown>, private readonly application: Application) {
    this.body = {
      esapReasons: body.esapReasons as Array<keyof EsapReasons>,
      esapFactors: body.esapFactors as Array<keyof EsapFactors>,
    }
  }

  previous() {
    return 'ap-type'
  }

  next() {
    if (this.body.esapReasons.includes('secreting')) {
      return 'esap-placement-secreting'
    }

    return 'esap-placement-cctv'
  }

  response() {
    return {
      [`${this.questions.esapReasons}`]: this.body.esapReasons.map(reason => esapReasons[reason]),
      [`${this.questions.esapFactors}`]: this.body.esapFactors?.map(factor => esapFactors[factor]),
    }
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.esapReasons || !this.body.esapReasons.length) {
      errors.esapReasons = `You must specify why ${this.application.person.name} requires an enhanced security placement`
    }

    return errors
  }

  reasons() {
    return convertKeyValuePairToCheckBoxItems(esapReasons, this.body.esapReasons)
  }

  factors() {
    return convertKeyValuePairToCheckBoxItems(esapFactors, this.body.esapFactors)
  }
}
