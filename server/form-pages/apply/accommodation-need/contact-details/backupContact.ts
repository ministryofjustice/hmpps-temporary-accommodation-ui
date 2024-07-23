import { TaskListErrors } from '@approved-premises/ui'
import { TemporaryAccommodationApplication as Application } from '@approved-premises/api'
import TasklistPage from '../../../tasklistPage'
import { Page } from '../../../utils/decorators'

type BackupContactBody = {
  name: string
  phone: string
  email: string
}

@Page({ name: 'backup-contact', bodyProperties: ['name', 'phone', 'email'] })
export default class BackupContact implements TasklistPage {
  title = 'Backup contact / senior probation officer details'

  htmlDocumentTitle = this.title

  constructor(
    readonly body: Partial<BackupContactBody>,
    readonly application: Application,
  ) {}

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
    return 'probation-practitioner'
  }

  next() {
    return 'pop-phone-number'
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
