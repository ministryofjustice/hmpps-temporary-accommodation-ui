/* eslint-disable */
import formatISO from 'date-fns/formatISO'
import parseISO from 'date-fns/parseISO'
import format from 'date-fns/format'
import { ObjectWithDateParts } from 'approved-premises'

export class DateFormats {
  /**
   * @param date JS Date object.
   * @returns the date in the format '2019-09-18'.
   */
  static formatApiDate(date: Date) {
    return formatISO(date, { representation: 'date' })
  }

}

