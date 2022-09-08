import type { TasklistPage } from 'approved-premises'

export default class EnterCRN implements TasklistPage {
  name = 'enter-crn'

  title = "Enter the individual's CRN"

  constructor(readonly body: Record<string, unknown>) {}

  next() {
    return 'confirm-details'
  }

  errors() {
    const errors = []

    if (!this.body.crn) {
      errors.push({
        propertyName: 'crn',
        errorType: 'blank',
      })
    }

    return errors
  }
}
