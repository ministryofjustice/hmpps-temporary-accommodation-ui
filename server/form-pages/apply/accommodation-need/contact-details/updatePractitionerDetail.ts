import { TemporaryAccommodationApplication as Application } from '@approved-premises/api'
import { PageResponse, type TaskListErrors } from '@approved-premises/ui'
import { SessionData } from 'express-session'
import { errorMessages } from './probationPractitioner'

export type UpdatePractitionerDetailKey = 'name' | 'email' | 'phone'
export type UpdatePractitionerDetailBody = Record<UpdatePractitionerDetailKey, string>

export default abstract class UpdatePractitionerDetail {
  abstract title: string

  abstract htmlDocumentTitle: string

  abstract propertyName: UpdatePractitionerDetailKey

  private readonly userDetails: {
    name?: string
    email?: string
    phone?: string
  }

  constructor(
    private _body: Partial<UpdatePractitionerDetailBody>,
    readonly application: Application,
    readonly session?: SessionData,
  ) {
    const { displayName: name, email, telephoneNumber: phone } = session?.userDetails || {}
    this.userDetails = {
      name,
      email,
      phone,
    }
  }

  set body(value) {
    if (value[this.propertyName] !== undefined) {
      this._body = value
    } else if (!this._body[this.propertyName]) {
      this._body[this.propertyName] = this.userDetails[this.propertyName]
    }
  }

  get body() {
    return this._body
  }

  response(): PageResponse {
    return {}
  }

  previous(): string {
    return 'probation-practitioner'
  }

  next(): string {
    return 'probation-practitioner'
  }

  errors(): Partial<Record<keyof this['body'], unknown>> {
    const errors: TaskListErrors<this> = {}

    if (!this.body[this.propertyName]) {
      errors[this.propertyName] = errorMessages[this.propertyName]
    }

    return errors
  }
}
