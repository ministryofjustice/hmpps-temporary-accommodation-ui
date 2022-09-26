/* eslint-disable */
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
   * @returns the date in the to be shown in the UI: "Thursday, 20 December 2012".
   */
  static dateObjtoUIDate(date: Date) {
    return format(date, 'cccc d MMMM y')
  }

  /**
   * @param isoDate an ISO date string.
   * @returns the date in the to be shown in the UI: "Thursday, 20 December 2012".
   */
  static isoDateToUIDate(isoDate: string) {
    return DateFormats.dateObjtoUIDate(DateFormats.convertIsoToDateObj(isoDate))
  }
}
