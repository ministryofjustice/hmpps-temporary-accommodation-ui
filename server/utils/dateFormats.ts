import formatISO from 'date-fns/formatISO'

// eslint-disable-next-line
export class DateFormats {
  static formatApiDate(date: Date) {
    return formatISO(date, { representation: 'date' })
  }
}
