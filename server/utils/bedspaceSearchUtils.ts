import { dateAndTimeInputsAreValidDates, dateIsBlank } from './dateUtils'
import { ObjectWithDateParts } from '../@types/ui'
import { insertGenericError } from './validation'
import { parseNumber } from './formUtils'

type BedspaceSearchQuery = ObjectWithDateParts<'startDate'> & {
  probationDeliveryUnits: Array<string>
  durationDays: string
}

export function validateSearchQuery(query: BedspaceSearchQuery): Error | null {
  const error = new Error() as Error & {
    data?: { 'invalid-params'?: Array<{ propertyName: string; errorType: string }> }
  }
  error.data = { 'invalid-params': [] }

  if (dateIsBlank(query, 'startDate')) {
    insertGenericError(error, 'startDate', 'empty')
  } else if (!dateAndTimeInputsAreValidDates(query, 'startDate')) {
    insertGenericError(error, 'startDate', 'invalid')
  }

  if (!query.probationDeliveryUnits?.length) {
    insertGenericError(error, 'probationDeliveryUnits', 'empty')
  }

  if (!query.durationDays) {
    insertGenericError(error, 'durationDays', 'empty')
  } else if (Number.isNaN(parseNumber(query.durationDays)) || parseNumber(query.durationDays) < 1) {
    insertGenericError(error, 'durationDays', 'mustBeAtLeast1')
  }

  return error.data?.['invalid-params']?.length ? error : null
}
