import type { ObjectWithDateParts } from 'approved-premises'

const properCase = (word: string): string =>
  word.length >= 1 ? word[0].toUpperCase() + word.toLowerCase().slice(1) : word

const isBlank = (str: string): boolean => !str || /^\s*$/.test(str)

/**
 * Converts a name (first name, last name, middle name, etc.) to proper case equivalent, handling double-barreled names
 * correctly (i.e. each part in a double-barreled is converted to proper case).
 * @param name name to be converted.
 * @returns name converted to proper case.
 */
const properCaseName = (name: string): string => (isBlank(name) ? '' : name.split('-').map(properCase).join('-'))

export class InvalidDateStringError extends Error {}

export const convertToTitleCase = (sentence: string): string =>
  isBlank(sentence) ? '' : sentence.split(' ').map(properCaseName).join(' ')

export const initialiseName = (fullName?: string): string | null => {
  // this check is for the authError page
  if (!fullName) return null

  const array = fullName.split(' ')
  return `${array[0][0]}. ${array.reverse()[0]}`
}

/**
 * Converts an object that may be a Date object or an ISO8601 datetime string into a Javascript Date object.
 * @param date Either a Javascript Date object or an ISO8601 datetime string
 * @returns A Date object
 * @throws {InvalidDateStringError} If the string is not a valid ISO8601 datetime string
 */
export const convertDateString = (date: string | Date): Date => {
  if (date instanceof Date) {
    return date
  }

  try {
    const parsedDate = new Date(Date.parse(date))

    if (date === parsedDate.toISOString()) {
      return parsedDate
    }

    throw new Error()
  } catch (error) {
    throw new InvalidDateStringError(`Invalid Date: ${date}`)
  }
}

/**
 * Converts input for a GDS date input https://design-system.service.gov.uk/components/date-input/
 * into a javascript date object
 * @param dateInputObj an object with date parts (i.e. `-month` `-day` `-year`), which come from a `govukDateInput`.
 * @param key the key that prefixes each item in the dateInputObj, also the name of the property which the date object will be returned in the return value.
 * @returns name converted to proper case.
 */
export const convertDateInputsToDateObj = <K extends string | number>(dateInputObj: ObjectWithDateParts<K>, key: K) => {
  const [day, month, year] = [
    Number(dateInputObj[`${key}-day`]),
    Number(dateInputObj[`${key}-month`]),
    Number(dateInputObj[`${key}-year`]),
  ]
  const o: { [P in K]?: Date } = dateInputObj
  if (day && month && year) {
    o[key] = new Date(Date.UTC(year, month - 1, day, 0, 0, 0))
  } else {
    o[key] = new Date(0, 0, 0)
  }
  return dateInputObj
}
