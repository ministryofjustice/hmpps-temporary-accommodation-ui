import { TemporaryAccommodationApplication as Application } from '@approved-premises/api'
import type { TaskListErrors } from '@approved-premises/ui'

type ContactDetailsBody = { name: string; phone: string; email: string }
export default abstract class ContactDetails {
  abstract title: string

  abstract previousPageId: string

  abstract nextPageId: string

  constructor(readonly body: Partial<ContactDetailsBody>, readonly application: Application) {}

  response() {
    return {
      [this.title]: [
        {
          Name: this.body.name,
          Phone: this.body.phone,
          Email: this.body.email,
        },
      ],
    }
  }

  previous() {
    return this.previousPageId
  }

  next() {
    return this.nextPageId
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.name) {
      errors.name = 'You must specify a name'
    }

    if (!this.body.phone) {
      errors.phone = 'You must specify a phone number'
    }

    if (!this.body.email) {
      errors.email = 'You must specify an email address'
    }

    return errors
  }
}
