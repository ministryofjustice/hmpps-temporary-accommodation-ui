import type { TasklistPage } from 'approved-premises'

export default class EnterCRN implements TasklistPage {
  name = 'enter-crn'

  title = "Enter the individual's CRN"

  body: { crn: string }

  constructor(body: Record<string, string>) {
    this.body = { crn: body.crn }
  }

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
