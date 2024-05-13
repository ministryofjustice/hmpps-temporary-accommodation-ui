/* eslint-disable */
import type { ObjectWithDateParts } from '@approved-premises/ui'
import { differenceInDays, isExists, isFuture, isPast } from 'date-fns'

import format from 'date-fns/format'
import formatISO from 'date-fns/formatISO'

export class DateFormats {
  /**
   * @param date JS Date object.
   * @returns the date in the format '2019-09-18'.
   */
  static dateObjToIsoDate(date: Date) {
    return formatISO(date, { representation: 'date' })
  }

  /**
   * @param date JS Date object.
   * @returns the date in the format '2019-09-18T00:00:00.000Z'.
   */
  static dateObjToIsoDateTime(date: Date) {
    return `${formatISO(date, { representation: 'date' })}T00:00:00.000Z`
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
  static isoToDateObj(date: string) {
    let parsedDate: Date

    try {
      parsedDate = new Date(date)
    } catch (error) {
      throw new InvalidDateStringError(`Invalid Date: ${date}`)
    }

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
    return DateFormats.dateObjtoUIDate(DateFormats.isoToDateObj(isoDate), options)
  }

  /**
   * @param isoDate an ISO date string.
   * @returns the date and time to be shown in the UI: "20 Dec 2012, 14:30".
   */
  static isoDateTimeToUIDateTime(isoDate: string) {
    return format(DateFormats.isoToDateObj(isoDate), 'd MMM y, HH:mm')
  }

  /**
   * Converts input for a GDS date input https://design-system.service.gov.uk/components/date-input/
   * into an ISO8601 date string
   * @param dateInputObj an object with date parts (i.e. `-month` `-day` `-year`), which come from a `govukDateInput`.
   * @param key the key that prefixes each item in the dateInputObj, also the name of the property which the date object will be returned in the return value.
   * @returns an ISO8601 date string.
   */
  static dateAndTimeInputsToIsoString<K extends string | number>(
    dateInputObj: Partial<ObjectWithDateParts<K>>,
    key: K,
    options: { representation: 'auto' | 'complete' } = { representation: 'auto' },
  ) {
    const yearKey = `${key}-year`
    const monthKey = `${key}-month`
    const dayKey = `${key}-day`
    const timeKey = `${key}-time`

    const year = (dateInputObj[yearKey] || '').trim() as string
    const month = `0${(dateInputObj[monthKey] || '').trim()}`.slice(-2)
    const day = `0${(dateInputObj[dayKey] || '').trim()}`.slice(-2)
    const time = dateInputObj[timeKey] as string

    let date: string
    if (day && month && year) {
      if (time) {
        date = `${year}-${month}-${day}T${time}:00.000Z`
      } else if (options.representation === 'complete') {
        date = `${year}-${month}-${day}T00:00:00.000Z`
      } else {
        date = `${year}-${month}-${day}`
      }
    } else {
      date = undefined
    }

    return {
      [yearKey]: dateInputObj[yearKey],
      [monthKey]: dateInputObj[monthKey],
      [dayKey]: dateInputObj[dayKey],
      [timeKey]: time,
      [key]: date,
    } as ObjectWithDateParts<K>
  }

  static isoToDateAndTimeInputs<K extends string | number>(isoDate: string, key: K): ObjectWithDateParts<K> {
    const date = this.isoToDateObj(isoDate)

    return {
      [`${key}-day`]: `${date.getDate()}`,
      [`${key}-month`]: `${date.getMonth() + 1}`,
      [`${key}-year`]: `${date.getFullYear()}`,
    } as ObjectWithDateParts<K>
  }

  /**
   * Converts input from the Datepicker component into an ISO8601 date string
   * @param dateString a date string formatted in the GB locale, with or without leading zeros (e.g. `6/04/2024`)
   * @returns an ISO8601 date string
   */
  static datepickerInputToIsoString(dateString: string) {
    const [day, month, year] = dateString.split('/')
    return `${year}-${`0${month}`.slice(-2)}-${`0${day}`.slice(-2)}`
  }

  static isoDateToDatepickerInput(dateString: string) {
    return dateString.split('-').reverse().join('/')
  }

  static isoDateToDaysFromNow(dateString: string) {
    const difference = differenceInDays(new Date(dateString).setHours(0, 0, 0, 0), new Date().setHours(0, 0, 0, 0))
    const numDays = Math.abs(difference)
    const text = `${numDays} ${numDays === 1 ? 'day' : 'days'}`

    if (difference < 0) {
      return `${text} ago`
    } else if (difference > 0) {
      return `in ${text}`
    } else {
      return 'today'
    }
  }
}

export const dateAndTimeInputsAreValidDates = <K extends string | number>(
  dateInputObj: Partial<ObjectWithDateParts<K>>,
  key: K,
): boolean => {
  const inputYear = dateInputObj?.[`${key}-year`] as string

  if (inputYear && inputYear.length !== 4) return false
  
  const dateString = DateFormats.dateAndTimeInputsToIsoString(dateInputObj, key)

  try {
    DateFormats.isoToDateObj(dateString[key])
  } catch (err) {
    if (err instanceof InvalidDateStringError) {
      return false
    }
  }

  return true
}

export const dateExists = (dateString: string) => {
  const [year, month, day] = dateString.split('-').map(Number)
  try {
    return isExists(year, month - 1, day)
  } catch (err) {
    return false
  }
}

export const dateIsBlank = <K extends string | number>(
  dateInputObj: Partial<ObjectWithDateParts<K>>,
  key: K,
): boolean => {
  return !['year' as const, 'month' as const, 'day' as const].every(part => !!dateInputObj[`${key}-${part}`])
}

export class InvalidDateStringError extends Error {}

export const dateIsInThePast = (dateString: string): boolean => {
  const date = DateFormats.isoToDateObj(dateString)
  return isPast(date)
}

export const dateIsInFuture = (dateString: string): boolean => {
  const date = DateFormats.isoToDateObj(dateString)
  return isFuture(date)
}

export const dateInputHint = (direction: 'past' | 'future') => {
  const year = new Date().getFullYear() + (direction === 'past' ? -1 : 1)

  return `For example, 27 3 ${year}`
}
