import { PageResponse, SummaryListItem, type TaskListErrors } from '@approved-premises/ui'
import { TemporaryAccommodationApplication as Application } from '@approved-premises/api'
import { SessionData } from 'express-session'
import TasklistPage from '../../../tasklistPage'
import { Page } from '../../../utils/decorators'
import { errorMessages } from './updatePractitionerDetail'
import paths from '../../../../paths/apply'

const bodyProperties = ['name', 'email', 'phone']

export type ProbationPractitionerBody = {
  name: string
  email: string
  phone: string
}

@Page({ name: 'probation-practitioner', bodyProperties })
export default class ProbationPractitioner implements TasklistPage {
  title = 'Confirm probation practitioner details'

  htmlDocumentTitle = this.title

  private readonly userDetails: Partial<ProbationPractitionerBody>

  constructor(
    private _body: Partial<ProbationPractitionerBody>,
    readonly application: Application,
    readonly session?: SessionData,
  ) {
    this.userDetails = {
      name: session?.userDetails?.displayName,
      email: session?.userDetails?.email,
      phone: session?.userDetails?.telephoneNumber,
    }
  }

  set body(existingValues) {
    this._body = bodyProperties.reduce((values, key) => {
      const updatedValue = this.application.data?.['contact-details']?.[`practitioner-${key}`]?.[key]

      values[key] = updatedValue || existingValues[key] || this.userDetails[key]

      return values
    }, {})
  }

  get body() {
    return this._body
  }

  previous(): string {
    return 'dashboard'
  }

  next(): string {
    return 'backup-contact'
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.name) {
      errors.name = errorMessages.name
    }

    if (!this.body.email) {
      errors.email = errorMessages.email
    }

    if (!this.body.phone) {
      errors.phone = errorMessages.phone
    }

    return errors
  }

  response(): PageResponse {
    return {
      'Probation practitioner details': [
        {
          Name: this.body.name,
          Email: this.body.email,
          Phone: this.body.phone,
        },
      ],
    }
  }

  private summaryListItem(key: keyof ProbationPractitionerBody, label: string): SummaryListItem {
    const editPath = paths.applications.pages.show({
      id: this.application.id,
      task: 'contact-details',
      page: `practitioner-${key}`,
    })

    return {
      key: { text: label },
      value: this.body[key]
        ? { text: this.body[key] }
        : {
            html: `<a href="${editPath}" class="govuk-link">Enter a${key === 'email' ? 'n' : ''} ${label.toLowerCase()}</a>`,
          },
      actions: this.body[key]
        ? {
            items: [
              {
                href: editPath,
                text: 'Change',
                visuallyHiddenText: label.toLowerCase(),
              },
            ],
          }
        : undefined,
    }
  }

  summaryListItems(): Array<SummaryListItem> {
    return [
      this.summaryListItem('name', 'Name'),
      this.summaryListItem('email', 'Email address'),
      this.summaryListItem('phone', 'Phone number'),
    ]
  }

  disableButton(): boolean {
    return Object.values(this._body).filter(Boolean).length !== bodyProperties.length
  }
}
