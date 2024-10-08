import { TemporaryAccommodationApplication as Application } from '@approved-premises/api'
import type { ObjectWithDateParts, TaskListErrors } from '@approved-premises/ui'
import { DateFormats, dateAndTimeInputsAreValidDates, dateIsBlank } from '../../../../utils/dateUtils'
import TasklistPage from '../../../tasklistPage'
import { dateBodyProperties } from '../../../utils'
import { Page } from '../../../utils/decorators'

type SentenceExpiryBody = ObjectWithDateParts<'sentenceExpiryDate'>

@Page({ name: 'sentence-expiry', bodyProperties: dateBodyProperties('sentenceExpiryDate') })
export default class SentenceExpiry implements TasklistPage {
  title = 'Sentence expiry date'

  htmlDocumentTitle = this.title

  constructor(
    private _body: Partial<SentenceExpiryBody>,
    readonly application: Application,
  ) {}

  public set body(value: Partial<SentenceExpiryBody>) {
    this._body = {
      ...value,
      ...DateFormats.dateAndTimeInputsToIsoString(value, 'sentenceExpiryDate'),
    }
  }

  public get body(): Partial<SentenceExpiryBody> {
    return this._body
  }

  response() {
    return {
      [this.title]: DateFormats.isoDateToUIDate(this.body.sentenceExpiryDate),
    }
  }

  previous() {
    return 'sentence-length'
  }

  next() {
    return 'release-type'
  }

  errors() {
    const errors: Record<string, string> = {}

    if (dateIsBlank(this.body, 'sentenceExpiryDate')) {
      errors.sentenceExpiryDate = 'You must specify the sentence expiry date'
    } else if (!dateAndTimeInputsAreValidDates(this.body, 'sentenceExpiryDate')) {
      errors.sentenceExpiryDate = 'You must specify a valid sentence expiry date'
    }

    return errors as TaskListErrors<this>
  }
}
