/* eslint-disable */
import formatISO from 'date-fns/formatISO'

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
}
