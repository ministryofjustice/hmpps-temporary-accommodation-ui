import { PageResponse, SummaryListItem, type TaskListErrors } from '@approved-premises/ui'
import { TemporaryAccommodationApplication as Application, ProbationDeliveryUnit } from '@approved-premises/api'
import { SessionData } from 'express-session'
import TasklistPage from '../../../tasklistPage'
import { Page } from '../../../utils/decorators'
import paths from '../../../../paths/apply'

const bodyProperties = ['name', 'email', 'phone', 'pdu']

export type ProbationPractitionerBody = {
  name: string
  email: string
  phone: string
  pdu: ProbationDeliveryUnit
}

export const errorMessages = {
  name: 'You must specify a name',
  email: 'You must specify an email address',
  phone: 'You must specify a phone number',
  pdu: 'You must select a PDU',
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
      pdu: session?.userDetails?.probationDeliveryUnit,
    }
  }

  set body(_submittedValues) {
    // This page does not submit any usable fields, so we ignore submitted values
    // and instead use values inferred from application data or session directly
    const existingValues = this.application.data?.['contact-details']?.['probation-practitioner']

    this._body = bodyProperties.reduce((body: Record<string, string | ProbationDeliveryUnit>, key) => {
      const updatedApplicationData = this.application.data?.['contact-details']?.[`practitioner-${key}`]
      let updatedValue: string | ProbationDeliveryUnit

      if (key === 'pdu' && updatedApplicationData) {
        updatedValue = {
          id: updatedApplicationData.id,
          name: updatedApplicationData.name,
        }
      } else {
        updatedValue = updatedApplicationData?.[key]
      }

      body[key] =
        updatedValue ||
        existingValues?.[key as keyof ProbationPractitionerBody] ||
        this.userDetails?.[key as keyof ProbationPractitionerBody]

      return body
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

    if (!this.body.pdu?.name || !this.body.pdu?.id) {
      errors.pdu = errorMessages.pdu
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
          PDU: this.body.pdu?.name,
        },
      ],
    }
  }

  private summaryListItem(key: keyof ProbationPractitionerBody, label: string, addLabel: string): SummaryListItem {
    const editPath = paths.applications.pages.show({
      id: this.application.id,
      task: 'contact-details',
      page: `practitioner-${key}`,
    })
    const value = key === 'pdu' ? this.body.pdu?.name : this.body[key]

    return {
      key: { text: label },
      value: value
        ? { text: value }
        : {
            html: `<a href="${editPath}" class="govuk-link">${addLabel}</a>`,
          },
      actions: value
        ? {
            items: [
              {
                href: editPath,
                text: 'Change',
                visuallyHiddenText: label,
              },
            ],
          }
        : undefined,
    }
  }

  summaryListItems(): Array<SummaryListItem> {
    return [
      this.summaryListItem('name', 'Name', 'Enter a name'),
      this.summaryListItem('email', 'Email address', 'Enter an email address'),
      this.summaryListItem('phone', 'Phone number', 'Enter a phone number'),
      this.summaryListItem('pdu', 'PDU (Probation Delivery Unit)', 'Enter a PDU'),
    ]
  }

  disableButton(): boolean {
    return (
      Object.values(this._body).filter(value => (typeof value === 'string' ? value : value?.name)).length !==
      bodyProperties.length
    )
  }
}
