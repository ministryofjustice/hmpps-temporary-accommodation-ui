import { TemporaryAccommodationApplication as Application } from '@approved-premises/api'
import type { PersonRisksUI, TaskListErrors } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

import { personName } from '../../../../utils/personUtils'
import { mapApiPersonRisksForUi } from '../../../../utils/utils'
import TasklistPage from '../../../tasklistPage'
import anonymiseFormContent from '../../../utils/anonymiseFormContent'

type AccommodationSharingBody = {
  accommodationSharing: string
  accommodationSharingYesDetail: string
  accommodationSharingNoDetail: string
  higherRisk: string
  higherRiskDetail: string
}

@Page({
  name: 'accommodation-sharing',
  bodyProperties: [
    'accommodationSharing',
    'accommodationSharingYesDetail',
    'accommodationSharingNoDetail',
    'higherRisk',
    'higherRiskDetail',
  ],
})
export default class AccommodationSharing implements TasklistPage {
  title = 'Accommodation sharing'

  htmlDocumentTitle = this.title

  questions: {
    accommodationSharing: string
    higherRisk: string
  }

  risks: PersonRisksUI

  constructor(
    readonly body: Partial<AccommodationSharingBody>,
    readonly application: Application,
  ) {
    this.questions = {
      accommodationSharing: `Is ${personName(application.person)} suitable to share accommodation with others?`,
      higherRisk: `Does ${personName(application.person)} pose a higher risk to any specific person or group if accommodated in a CAS3 property during curfew?`,
    }

    this.risks = mapApiPersonRisksForUi(application.risks)
  }

  response() {
    const out: Record<string, string> = {}
    const qAccommodationSharing = anonymiseFormContent(this.questions.accommodationSharing, this.application.person)
    out[qAccommodationSharing] =
      this.body.accommodationSharing === 'yes'
        ? `Yes - ${this.body.accommodationSharingYesDetail}`
        : `No - ${this.body.accommodationSharingNoDetail}`

    const qHigherRisk = anonymiseFormContent(this.questions.higherRisk, this.application.person)
    out[qHigherRisk] = this.body.higherRisk === 'yes' ? `Yes - ${this.body.higherRiskDetail}` : `No`

    return out
  }

  previous() {
    return 'dashboard'
  }

  next() {
    return 'cooperation'
  }

  errors() {
    const errors: TaskListErrors<this> = {}
    if (this.body.accommodationSharing !== 'yes') {
      this.body.accommodationSharingYesDetail = ''
    }
    if (this.body.accommodationSharing !== 'no') {
      this.body.accommodationSharingNoDetail = ''
    }
    if (this.body.higherRisk !== 'yes') {
      this.body.higherRiskDetail = ''
    }

    if (!this.body.accommodationSharing) {
      errors.accommodationSharing = `You must specify if ${personName(
        this.application.person,
      )} would be able to share accommodation with others`
    }

    if (this.body.accommodationSharing === 'yes' && !this.body.accommodationSharingYesDetail) {
      errors.accommodationSharingYesDetail =
        "You must provide details of how you will manage the person's risk if they are placed in shared accommodation"
    }

    if (this.body.accommodationSharing === 'no' && !this.body.accommodationSharingNoDetail) {
      errors.accommodationSharingNoDetail =
        'You must provide details of why the person is unsuitable to share accommodation with others'
    }

    if (!this.body.higherRisk) {
      errors.higherRisk = `Select whether ${personName(
        this.application.person,
      )} poses a higher risk to any specific person or group if accommodated in a CAS3 property during curfew`
    }

    if (this.body.higherRisk === 'yes' && !this.body.higherRiskDetail) {
      errors.higherRiskDetail = 'Enter details of who is at risk and what the risks are'
    }
    return errors
  }
}
