import { TemporaryAccommodationApplication as Application } from '@approved-premises/api'
import type { TaskListErrors } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'

export type NeedsEvidenceBody = Record<string, never>

@Page({ name: 'needs-evidence', bodyProperties: [] })
export default class NeedsEvidence implements TasklistPage {
  title = 'Evidence must be in NDelius before you can submit the referral'

  htmlDocumentTitle = this.title

  pduName: string

  constructor(
    private _body: Partial<NeedsEvidenceBody>,
    readonly application: Application,
  ) {
    this.pduName = application.data?.['placement-location']?.['placement-pdu'].pduName
  }

  static async initialize(body: NeedsEvidenceBody, application: Application) {
    return new NeedsEvidence(body, application)
  }

  set body(value) {
    this._body = null as NeedsEvidenceBody
  }

  get body() {
    return this._body
  }

  response(): null {
    return null
  }

  previous() {
    return 'pdu-evidence'
  }

  next() {
    return ''
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    return errors
  }
}
