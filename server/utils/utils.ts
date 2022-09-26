import { format } from 'date-fns'
import type { ObjectWithDateParts } from 'approved-premises'
import { SessionDataError } from './errors'
import { DateFormats, InvalidDateStringError } from './dateFormats'

/* istanbul ignore next */
const properCase = (word: string): string =>
  word.length >= 1 ? word[0].toUpperCase() + word.toLowerCase().slice(1) : word

/* istanbul ignore next */
const isBlank = (str: string): boolean => !str || /^\s*$/.test(str)

/**
 * Converts a name (first name, last name, middle name, etc.) to proper case equivalent, handling double-barreled names
 * correctly (i.e. each part in a double-barreled is converted to proper case).
 * @param name name to be converted.
 * @returns name converted to proper case.
 */
const properCaseName = (name: string): string => (isBlank(name) ? '' : name.split('-').map(properCase).join('-'))

export const convertToTitleCase = (sentence: string): string =>
  isBlank(sentence) ? '' : sentence.split(' ').map(properCaseName).join(' ')

export const initialiseName = (fullName?: string): string | null => {
  // this check is for the authError page
  if (!fullName) return null

  const array = fullName.split(' ')
  return `${array[0][0]}. ${array.reverse()[0]}`
}

/**
 * Converts a string from any case to kebab-case
 * @param string string to be converted.
 * @returns name converted to kebab-case.
 */
const kebabCase = (string: string) =>
  string
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()


export class InvalidDateStringError extends Error {}
/**
 * Converts an ISO8601 datetime string into a Javascript Date object.
 * @param date An ISO8601 datetime string
 * @returns A Date object
 * @throws {InvalidDateStringError} If the string is not a valid ISO8601 datetime string
 */
export const convertDateString = (date: string): Date => {
  const parsedDate = parseISO(date)

  if (Number.isNaN(parsedDate.getTime())) {
    throw new InvalidDateStringError(`Invalid Date: ${date}`)
  }

  return parsedDate
}

/**
 * Converts input for a GDS date input https://design-system.service.gov.uk/components/date-input/
 * into an ISO8601 date string
 * @param dateInputObj an object with date parts (i.e. `-month` `-day` `-year`), which come from a `govukDateInput`.
 * @param key the key that prefixes each item in the dateInputObj, also the name of the property which the date object will be returned in the return value.
 * @returns an ISO8601 date string.
 */
export const convertDateAndTimeInputsToIsoString = <K extends string | number>(
  dateInputObj: ObjectWithDateParts<K>,
  key: K,
) => {
  const day = `0${dateInputObj[`${key}-day`]}`.slice(-2)
  const month = `0${dateInputObj[`${key}-month`]}`.slice(-2)
  const year = dateInputObj[`${key}-year`]
  const time = dateInputObj[`${key}-time`]

  const timeSegment = time || '00:00'

  const o: { [P in K]?: string } = dateInputObj
  if (day && month && year) {
    o[key] = `${year}-${month}-${day}T${timeSegment}:00.000Z`
  } else {
    o[key] = ''
  }

  return dateInputObj
}

export const dateAndTimeInputsAreValidDates = <K extends string | number>(
  dateInputObj: ObjectWithDateParts<K>,
  key: K,
): boolean => {
  const dateString = convertDateAndTimeInputsToIsoString(dateInputObj, key)

  try {
    DateFormats.convertIsoToDateObj(dateString[key])
  } catch (err) {
    if (err instanceof InvalidDateStringError) {
      return false
    }
  }

  return true
}

/**
 * Retrieves response for a given question from the session object.
 * @param sessionData the session data for an application.
 * @param question the question that we need the response for in camelCase.
 * @returns name converted to proper case.
 */
export const retrieveQuestionResponseFromSession = <T>(sessionData: Record<string, unknown>, question: string) => {
  try {
    return sessionData['basic-information'][kebabCase(question)][question] as T
  } catch (e) {
    throw new SessionDataError(`Question ${question} was not found in the session`)
  }
}

export const dateIsBlank = <T = ObjectWithDateParts<string | number>>(body: T): boolean => {
  const fields = Object.keys(body).filter(key => key.match(/-[year|month|day]/))
  return fields.every(field => !body[field])
}
