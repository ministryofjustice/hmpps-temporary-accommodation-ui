import type { ObjectWithDateParts } from 'approved-premises'
import { SessionDataError } from './errors'
import {
  convertDateString,
  convertToTitleCase,
  initialiseName,
  convertDateAndTimeInputsToIsoString,
  InvalidDateStringError,
  formatDate,
  formatDateString,
  dateAndTimeInputsAreValidDates,
  retrieveQuestionResponseFromSession,
} from './utils'

describe('convert to title case', () => {
  it.each([
    [null, null, ''],
    ['empty string', '', ''],
    ['Lower case', 'robert', 'Robert'],
    ['Upper case', 'ROBERT', 'Robert'],
    ['Mixed case', 'RoBErT', 'Robert'],
    ['Multiple words', 'RobeRT SMiTH', 'Robert Smith'],
    ['Leading spaces', '  RobeRT', '  Robert'],
    ['Trailing spaces', 'RobeRT  ', 'Robert  '],
    ['Hyphenated', 'Robert-John SmiTH-jONes-WILSON', 'Robert-John Smith-Jones-Wilson'],
  ])('%s convertToTitleCase(%s, %s)', (_: string, a: string, expected: string) => {
    expect(convertToTitleCase(a)).toEqual(expected)
  })
})

describe('initialise name', () => {
  it.each([
    [null, null, null],
    ['Empty string', '', null],
    ['One word', 'robert', 'r. robert'],
    ['Two words', 'Robert James', 'R. James'],
    ['Three words', 'Robert James Smith', 'R. Smith'],
    ['Double barrelled', 'Robert-John Smith-Jones-Wilson', 'R. Smith-Jones-Wilson'],
  ])('%s initialiseName(%s, %s)', (_: string, a: string, expected: string) => {
    expect(initialiseName(a)).toEqual(expected)
  })
})

describe('formatDate', () => {
  it('converts a date to a GOV.UK formatted date', () => {
    const date1 = new Date(2022, 7, 1)
    const date2 = new Date(2022, 8, 16)

    expect(formatDate(date1)).toEqual('Monday 1 August 2022')
    expect(formatDate(date2)).toEqual('Friday 16 September 2022')
  })
})

describe('formatDateString', () => {
  it('converts a ISO8601 date string to a GOV.UK formatted date', () => {
    const date = '2022-11-11T00:00:00.000Z'

    expect(formatDateString(date)).toEqual('Friday 11 November 2022')
  })

  it('raises an error if the date is not a valid ISO8601 date string', () => {
    const date = '23/11/2022'

    expect(() => formatDateString(date)).toThrow(new InvalidDateStringError(`Invalid Date: ${date}`))
  })

  it('raises an error if the date is not a date string', () => {
    const date = 'NOT A DATE'

    expect(() => formatDateString(date)).toThrow(new InvalidDateStringError(`Invalid Date: ${date}`))
  })
})

describe('convertDateInputsToDateObj', () => {
  it('converts a date object', () => {
    const obj: ObjectWithDateParts<'date'> = {
      'date-year': '2022',
      'date-month': '12',
      'date-day': '11',
    }

    const result = convertDateAndTimeInputsToIsoString(obj, 'date')

    expect(result.date).toEqual(new Date(2022, 11, 11).toISOString())
  })

  it('pads the months and days', () => {
    const obj: ObjectWithDateParts<'date'> = {
      'date-year': '2022',
      'date-month': '1',
      'date-day': '1',
    }

    const result = convertDateAndTimeInputsToIsoString(obj, 'date')

    expect(result.date).toEqual(new Date(2022, 0, 1).toISOString())
  })

  it('returns the date with a time if passed one', () => {
    const obj: ObjectWithDateParts<'date'> = {
      'date-year': '2022',
      'date-month': '1',
      'date-day': '1',
      'date-time': '12:35',
    }

    const result = convertDateAndTimeInputsToIsoString(obj, 'date')

    expect(result.date).toEqual(new Date(2022, 0, 1, 12, 35).toISOString())
  })

  it('returns an empty string when given empty strings as input', () => {
    const obj: ObjectWithDateParts<'date'> = {
      'date-year': '',
      'date-month': '',
      'date-day': '',
    }

    const result = convertDateAndTimeInputsToIsoString(obj, 'date')

    expect(result.date).toEqual('')
  })

  it('returns an invalid ISO string when given invalid strings as input', () => {
    const obj: ObjectWithDateParts<'date'> = {
      'date-year': 'twothousandtwentytwo',
      'date-month': '20',
      'date-day': 'foo',
    }

    const result = convertDateAndTimeInputsToIsoString(obj, 'date')

    expect(result.date.toString()).toEqual('twothousandtwentytwo-20-ooT00:00:00.000Z')
  })
})

describe('convertDateString', () => {
  it('converts a ISO8601 date string', () => {
    const date = '2022-11-11T00:00:00.000Z'

    expect(convertDateString(date)).toEqual(new Date(2022, 10, 11))
  })

  it('raises an error if the date is not a valid ISO8601 date string', () => {
    const date = '23/11/2022'

    expect(() => convertDateString(date)).toThrow(new InvalidDateStringError(`Invalid Date: ${date}`))
  })

  it('raises an error if the date is not a date string', () => {
    const date = 'NOT A DATE'

    expect(() => convertDateString(date)).toThrow(new InvalidDateStringError(`Invalid Date: ${date}`))
  })
})

describe('dateAndTimeInputsAreValidDates', () => {
  it('returns true when the date is valid', () => {
    const obj: ObjectWithDateParts<'date'> = {
      'date-year': '2022',
      'date-month': '12',
      'date-day': '11',
    }

    const result = dateAndTimeInputsAreValidDates(obj, 'date')

    expect(result).toEqual(true)
  })

  it('returns false when the date is invalid', () => {
    const obj: ObjectWithDateParts<'date'> = {
      'date-year': '99',
      'date-month': '99',
      'date-day': '99',
    }

    const result = dateAndTimeInputsAreValidDates(obj, 'date')

    expect(result).toEqual(false)
  })
})

describe('retrieveQuestionResponseFromSession', () => {
  it("throws a SessionDataError if the property doesn't exist", () => {
    expect(() => retrieveQuestionResponseFromSession({}, '')).toThrow(SessionDataError)
  })

  it('returns the property if it does existion', () => {
    const questionResponse = retrieveQuestionResponseFromSession(
      {
        'basic-information': { 'question-response': { questionResponse: 'no' } },
      },
      'questionResponse',
    )
    expect(questionResponse).toBe('no')
  })
})
