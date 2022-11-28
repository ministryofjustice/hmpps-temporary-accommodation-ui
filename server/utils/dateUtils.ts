/* eslint-disable */
import type { ObjectWithDateParts } from '@approved-premises/ui'

import formatISO from 'date-fns/formatISO'
import parseISO from 'date-fns/parseISO'
import format from 'date-fns/format'

export class DateFormats {
  /**
   * @param date JS Date object.
   * @returns the date in the format '2019-09-18'.
   */
  static formatApiDate(date: Date) {
    return formatISO(date, { representation: 'date' })
  }

  /**
   * @param date JS Date object.
   * @returns the date in the format '2019-09-18T19:00:52Z'.
   */
  static formatApiDateTime(date: Date) {
    return formatISO(date)
  }

  /**
   * @param date JS Date object.
   * @returns the date in the to be shown in the UI: "20 December 2012".
   */
  static dateObjtoUIDate(date: Date, options: { format: 'short' | 'long' } = { format: 'long' }) {
    if (options.format === 'long') {
      return format(date, 'd MMMM y')
    } else {
      return format(date, 'd MMM yy')
    }
  }

  /**
   * Converts an ISO8601 datetime string into a Javascript Date object.
   * @param date An ISO8601 datetime string
   * @returns A Date object
   * @throws {InvalidDateStringError} If the string is not a valid ISO8601 datetime string
   */
  static convertIsoToDateObj(date: string) {
    const parsedDate = parseISO(date)

    if (Number.isNaN(parsedDate.getTime())) {
      throw new InvalidDateStringError(`Invalid Date: ${date}`)
    }

    return parsedDate
  }

  /**
   * @param isoDate an ISO date string.
   * @returns the date in the to be shown in the UI: "20 December 2012".
   */
  static isoDateToUIDate(isoDate: string, options: { format: 'short' | 'long' } = { format: 'long' }) {
    return DateFormats.dateObjtoUIDate(DateFormats.convertIsoToDateObj(isoDate), options)
  }

  /**
   * Converts input for a GDS date input https://design-system.service.gov.uk/components/date-input/
   * into an ISO8601 date string
   * @param dateInputObj an object with date parts (i.e. `-month` `-day` `-year`), which come from a `govukDateInput`.
   * @param key the key that prefixes each item in the dateInputObj, also the name of the property which the date object will be returned in the return value.
   * @returns an ISO8601 date string.
   */
  static convertDateAndTimeInputsToIsoString<K extends string | number>(dateInputObj: ObjectWithDateParts<K>, key: K) {
    const day = `0${dateInputObj[`${key}-day`]}`.slice(-2)
    const month = `0${dateInputObj[`${key}-month`]}`.slice(-2)
    const year = dateInputObj[`${key}-year`]
    const time = dateInputObj[`${key}-time`]

    const o: { [P in K]?: string } = dateInputObj
    if (day && month && year) {
      if (time) {
        o[key] = `${year}-${month}-${day}T${time}:00.000Z`
      } else {
        o[key] = `${year}-${month}-${day}`
      }
    } else {
      o[key] = undefined
    }

    return dateInputObj
  }

  static convertIsoToDateAndTimeInputs<K extends string | number>(isoDate: string, key: K): ObjectWithDateParts<K> {
    const date = this.convertIsoToDateObj(isoDate)
    
    return {
      [`${key}-day`]: `${date.getDate()}`,
      [`${key}-month`]: `${date.getMonth() + 1}`,
      [`${key}-year`]: `${date.getFullYear()}`,
    } as ObjectWithDateParts<K>
  }
}

export const dateAndTimeInputsAreValidDates = <K extends string | number>(
  dateInputObj: ObjectWithDateParts<K>,
  key: K,
): boolean => {
  const dateString = DateFormats.convertDateAndTimeInputsToIsoString(dateInputObj, key)

  try {
    DateFormats.convertIsoToDateObj(dateString[key])
  } catch (err) {
    if (err instanceof InvalidDateStringError) {
      return false
    }
  }

  return true
}

export const dateIsBlank = <T = ObjectWithDateParts<string | number>>(body: T): boolean => {
  const fields = Object.keys(body).filter(key => key.match(/-[year|month|day]/))
  return fields.every(field => !body[field])
}

export class InvalidDateStringError extends Error {}
