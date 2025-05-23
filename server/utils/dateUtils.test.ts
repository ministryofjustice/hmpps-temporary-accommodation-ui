import { addDays, addMonths, subDays, subMonths } from 'date-fns'
import type { ObjectWithDateParts } from '@approved-premises/ui'
import {
  DateFormats,
  InvalidDateStringError,
  dateAndTimeInputsAreValidDates,
  dateExists,
  dateInputHint,
  dateIsBlank,
  dateIsInFuture,
  dateIsInThePast,
  dateIsWithinLastSevenDays,
  dateIsWithinNextThreeMonths,
  datepickerInputsAreValidDates,
} from './dateUtils'

describe('DateFormats', () => {
  describe('dateObjToIsoDate', () => {
    it('converts a date object to a ISO8601 date string', () => {
      expect(DateFormats.dateObjToIsoDate(new Date(2022, 4, 11))).toEqual('2022-05-11')
    })
  })

  describe('dateObjToIsoDateTime', () => {
    it('converts a date object to a ISO8601 date string, with the time as midnight', () => {
      expect(DateFormats.dateObjToIsoDateTime(new Date(2022, 4, 11))).toEqual('2022-05-11T00:00:00.000Z')
    })
  })

  describe('isoToDateObj', () => {
    it('converts a ISO8601 date string', () => {
      const date = '2022-11-11T00:00:00.000Z'

      expect(DateFormats.isoToDateObj(date)).toEqual(new Date(2022, 10, 11))
    })

    it('raises an error if the date is not a valid ISO8601 date string', () => {
      const date = '23/11/2022'

      expect(() => DateFormats.isoToDateObj(date)).toThrow(new InvalidDateStringError(`Invalid Date: ${date}`))
    })

    it('raises an error if the date is not a date string', () => {
      const date = 'NOT A DATE'

      expect(() => DateFormats.isoToDateObj(date)).toThrow(new InvalidDateStringError(`Invalid Date: ${date}`))
    })
  })

  describe('isoDateToUIDate', () => {
    it('converts a ISO8601 date string to a GOV.UK formatted date', () => {
      const date = '2022-11-11T00:00:00.000Z'

      expect(DateFormats.isoDateToUIDate(date)).toEqual('11 November 2022')
    })

    it('converts a ISO8601 date string to a short format date', () => {
      const date = '2022-11-11T00:00:00.000Z'

      expect(DateFormats.isoDateToUIDate(date, { format: 'short' })).toEqual('11 Nov 22')
    })

    it('raises an error if the date is not a valid ISO8601 date string', () => {
      const date = '23/11/2022'

      expect(() => DateFormats.isoDateToUIDate(date)).toThrow(new InvalidDateStringError(`Invalid Date: ${date}`))
    })

    it('raises an error if the date is not a date string', () => {
      const date = 'NOT A DATE'

      expect(() => DateFormats.isoDateToUIDate(date)).toThrow(new InvalidDateStringError(`Invalid Date: ${date}`))
    })
  })

  describe('isoDateTimeToUIDateTime', () => {
    it('converts a ISO8601 date string to a GOV.UK formatted date', () => {
      const date = '2022-11-11T10:00:00.000Z'

      expect(DateFormats.isoDateTimeToUIDateTime(date)).toEqual('11 Nov 2022, 10:00')
    })

    it('raises an error if the date is not a valid ISO8601 date string', () => {
      const date = '23/11/2022'

      expect(() => DateFormats.isoDateTimeToUIDateTime(date)).toThrow(
        new InvalidDateStringError(`Invalid Date: ${date}`),
      )
    })

    it('raises an error if the date is not a date string', () => {
      const date = 'NOT A DATE'

      expect(() => DateFormats.isoDateTimeToUIDateTime(date)).toThrow(
        new InvalidDateStringError(`Invalid Date: ${date}`),
      )
    })
  })

  describe('dateAndTimeInputsToIsoString', () => {
    it('converts a date object', () => {
      const obj: ObjectWithDateParts<'date'> = {
        'date-year': '2022',
        'date-month': '12',
        'date-day': '11',
      }

      const result = DateFormats.dateAndTimeInputsToIsoString(obj, 'date')

      expect(result.date).toEqual('2022-12-11')
    })

    it('pads the months and days', () => {
      const obj: ObjectWithDateParts<'date'> = {
        'date-year': '2022',
        'date-month': '1',
        'date-day': '1',
      }

      const result = DateFormats.dateAndTimeInputsToIsoString(obj, 'date')

      expect(result.date).toEqual('2022-01-01')
    })

    it('trims the entered month, day and year of whitespace', () => {
      const obj: ObjectWithDateParts<'date'> = {
        'date-year': '  2024',
        'date-month': '11  ',
        'date-day': '  5  ',
      }

      const result = DateFormats.dateAndTimeInputsToIsoString(obj, 'date')

      expect(result.date).toEqual('2024-11-05')
    })

    it('returns the date with a time if passed one', () => {
      const obj: ObjectWithDateParts<'date'> = {
        'date-year': '2022',
        'date-month': '1',
        'date-day': '1',
        'date-time': '12:35',
      }

      const result = DateFormats.dateAndTimeInputsToIsoString(obj, 'date')

      expect(result.date).toEqual('2022-01-01T12:35:00.000Z')
    })

    it('returns the date with a time if passed one and the representation is specified as complete', () => {
      const obj: ObjectWithDateParts<'date'> = {
        'date-year': '2022',
        'date-month': '1',
        'date-day': '1',
        'date-time': '12:35',
      }

      const result = DateFormats.dateAndTimeInputsToIsoString(obj, 'date', { representation: 'complete' })

      expect(result.date).toEqual('2022-01-01T12:35:00.000Z')
    })

    it('returns the date with the time set to midnight if not passed a time and the representation is specified as complete', () => {
      const obj: ObjectWithDateParts<'date'> = {
        'date-year': '2022',
        'date-month': '1',
        'date-day': '1',
      }

      const result = DateFormats.dateAndTimeInputsToIsoString(obj, 'date', { representation: 'complete' })

      expect(result.date).toEqual('2022-01-01T00:00:00.000Z')
    })

    it('returns an empty string when given empty strings as input', () => {
      const obj: ObjectWithDateParts<'date'> = {
        'date-year': '',
        'date-month': '',
        'date-day': '',
      }

      const result = DateFormats.dateAndTimeInputsToIsoString(obj, 'date')

      expect(result.date).toBeUndefined()
    })

    it('returns an invalid ISO string when given invalid strings as input', () => {
      const obj: ObjectWithDateParts<'date'> = {
        'date-year': 'twothousandtwentytwo',
        'date-month': '20',
        'date-day': 'foo',
      }

      const result = DateFormats.dateAndTimeInputsToIsoString(obj, 'date')

      expect(result.date.toString()).toEqual('twothousandtwentytwo-20-oo')
    })
  })

  describe('datepickerInputToIsoString', () => {
    it.each([
      ['01/01/1970', '1970-01-01'],
      ['03/04/2023', '2023-04-03'],
      ['12/10/2020', '2020-10-12'],
      ['3/7/1999', '1999-07-03'],
    ])('parses %s as %s', (input, output) => {
      expect(DateFormats.datepickerInputToIsoString(input)).toEqual(output)
    })
  })

  describe('isoDateToDatepickerInput', () => {
    it.each([
      ['2024-04-14', '14/04/2024'],
      ['1970-12-01', '01/12/1970'],
    ])('parses %s as %s', (input, output) => {
      expect(DateFormats.isoDateToDatepickerInput(input)).toEqual(output)
    })
  })

  describe('isoDateToDaysFromNow', () => {
    beforeEach(() => {
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2024-04-08T00:01:00.000'))
    })

    it('returns days ago if the date is in the past', () => {
      expect(DateFormats.isoDateToDaysFromNow('2024-03-12')).toEqual('27 days ago')
    })

    it('returns one day ago if the date is yesterday', () => {
      expect(DateFormats.isoDateToDaysFromNow('2024-04-07')).toEqual('1 day ago')
    })

    it('returns today if the date is today', () => {
      expect(DateFormats.isoDateToDaysFromNow('2024-04-08')).toEqual('today')
    })

    it('returns the number of days if the date is in the future', () => {
      expect(DateFormats.isoDateToDaysFromNow('2024-04-16')).toEqual('in 8 days')
    })

    it('returns one day if the date is tomorrow', () => {
      expect(DateFormats.isoDateToDaysFromNow('2024-04-09')).toEqual('in 1 day')
    })
  })

  describe('datepickerInputToDateAndTimeInputs', () => {
    it('converts a date string to ObjectWithDateParts', () => {
      const dateString = '13/03/2025'
      const result = DateFormats.datepickerInputToDateAndTimeInputs(dateString, 'startDate')
      expect(result).toEqual({
        'startDate-day': '13',
        'startDate-month': '03',
        'startDate-year': '2025',
      })
    })
  })
})

describe('isoToDateAndTimeInputs', () => {
  it('converts a ISO8601 date string', () => {
    const date = '2022-11-23'

    expect(DateFormats.isoToDateAndTimeInputs(date, 'date')).toEqual({
      'date-day': '23',
      'date-month': '11',
      'date-year': '2022',
    })
  })

  it('raises an error if the date is not a valid ISO8601 date string', () => {
    const date = '23/11/2022'

    expect(() => DateFormats.isoToDateAndTimeInputs(date, 'date')).toThrow(
      new InvalidDateStringError(`Invalid Date: ${date}`),
    )
  })

  it('raises an error if the date is not a date string', () => {
    const date = 'NOT A DATE'

    expect(() => DateFormats.isoToDateAndTimeInputs(date, 'date')).toThrow(
      new InvalidDateStringError(`Invalid Date: ${date}`),
    )
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

  it('returns true for a valid leap year date', () => {
    const obj: ObjectWithDateParts<'date'> = {
      'date-year': '2024',
      'date-month': '02',
      'date-day': '29',
    }

    const result = dateAndTimeInputsAreValidDates(obj, 'date')

    expect(result).toEqual(true)
  })

  describe.each([
    [{ 'date-year': 2022, 'date-month': '12', 'date-day': '11' }, 'invalid data type for year'],
    [{ 'date-year': '2022', 'date-month': 12, 'date-day': '11' }, 'invalid data type for month'],
    [{ 'date-year': '2022', 'date-month': '12', 'date-day': 11 }, 'invalid data type for day'],
  ])('returns false when the date has invalid data type %s', (obj, description) => {
    it(`returns false for ${description}`, () => {
      // @ts-expect-error: passing the date input object in this format is required here to test type confusion
      //  this was introduce based on a crtical  secure alert was generated and this tests the fix
      const result = dateAndTimeInputsAreValidDates(obj, 'date')
      expect(result).toEqual(false)
    })
  })

  describe.each([
    [{ 'date-year': '2022', 'date-month': '13', 'date-day': '11' }, 'invalid month'],
    [{ 'date-year': '2022', 'date-month': '111', 'date-day': '11' }, 'invalid month over 2 digits'],
    [{ 'date-year': '2022', 'date-month': '12', 'date-day': '32' }, 'invalid day'],
    [{ 'date-year': '2022', 'date-month': '12', 'date-day': '111' }, 'invalid day over 2 digits'],
    [{ 'date-year': '99', 'date-month': '99', 'date-day': '99' }, 'invalid date'],
    [{ 'date-year': '202', 'date-month': '01', 'date-day': '01' }, 'year not 4 digits'],
    [{ 'date-year': '2024', 'date-month': '11', 'date-day': '31' }, 'well formatted but non-existent date'],
    [{ 'date-year': 'not', 'date-month': 'a', 'date-day': 'date' }, 'gibberish date'],
    [{ 'date-year': '2021', 'date-month': '02', 'date-day': '29' }, 'invalid leap year date'],
  ])('returns false when the date has %s', (obj, description) => {
    it(`returns false for ${description}`, () => {
      const result = dateAndTimeInputsAreValidDates(obj, 'date')
      expect(result).toEqual(false)
    })
  })
})

describe('datepickerInputsAreValidDates', () => {
  it('returns true for a valid date string', () => {
    const dateString = '13/03/2025'
    const result = datepickerInputsAreValidDates(dateString, 'startDate')
    expect(result).toEqual(true)
  })

  it('returns false for an invalid date string', () => {
    const dateString = '31/02/2025'
    const result = datepickerInputsAreValidDates(dateString, 'startDate')
    expect(result).toEqual(false)
  })
})

describe('dateIsBlank', () => {
  it('returns false if the date is not blank', () => {
    const date: ObjectWithDateParts<'field'> = {
      'field-day': '12',
      'field-month': '1',
      'field-year': '2022',
    }

    expect(dateIsBlank(date, 'field')).toEqual(false)
  })

  it('returns true if the date is blank', () => {
    const date: ObjectWithDateParts<'field'> = {
      'field-day': '',
      'field-month': '',
      'field-year': '',
    }

    expect(dateIsBlank(date, 'field')).toEqual(true)
  })

  it('ignores irrelevant fields', () => {
    const date: ObjectWithDateParts<'field'> & ObjectWithDateParts<'otherField'> = {
      'field-day': '12',
      'field-month': '1',
      'field-year': '2022',
      'otherField-day': undefined,
      'otherField-month': undefined,
      'otherField-year': undefined,
    }

    expect(dateIsBlank(date, 'field')).toEqual(false)
  })
})

describe('dateIsInThePast', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2024-06-06T14:07:00.000Z'))
  })

  it('returns true if the date is in the past', () => {
    expect(dateIsInThePast('2020-01-01')).toEqual(true)
  })

  it('returns false if the date is today', () => {
    expect(dateIsInThePast('2024-06-06')).toEqual(false)
  })

  it('returns false if the date is not in the past', () => {
    expect(dateIsInThePast('2024-06-07')).toEqual(false)
  })
})

describe('dateIsInTheFuture', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2024-06-06T14:07:00.000Z'))
  })

  it('returns true if the date is in the future', () => {
    expect(dateIsInFuture('2024-06-07')).toEqual(true)
  })

  it('returns false if the date is today', () => {
    expect(dateIsInFuture('2024-06-06')).toEqual(false)
  })

  it('returns false if the date is not in the future', () => {
    expect(dateIsInFuture('2020-01-01')).toEqual(false)
  })
})

describe('dateInputHint', () => {
  it('returns hint text with an example past date', () => {
    jest.useFakeTimers().setSystemTime(new Date('2027-03-11'))

    expect(dateInputHint('past')).toEqual('For example, 27 3 2026')
  })

  it('returns hint text with an example future date', () => {
    jest.useFakeTimers().setSystemTime(new Date('2027-03-11'))

    expect(dateInputHint('future')).toEqual('For example, 27 3 2028')
  })
})

describe('dateExists', () => {
  it.each([
    ['2024-01-01', true],
    ['1999-12-12', true],
    ['2024-02-29', true],
    ['2021-02-29', false],
    ['2024-02-30', false],
    ['2020-13-01', false],
    ['24-01-01', false],
    ['not even a date', false],
  ])('for %s returns %s', (input, expected) => {
    expect(dateExists(input)).toEqual(expected)
  })

  describe('dateIsWithinNextThreeMonths', () => {
    it('returns true if the date is within the next 3 months', () => {
      const validDate = DateFormats.dateObjToIsoDate(addMonths(new Date(), 2))
      expect(dateIsWithinNextThreeMonths(validDate)).toBe(true)
    })

    it('returns false if the date is more than 3 months in the future', () => {
      const invalidDate = DateFormats.dateObjToIsoDate(addMonths(new Date(), 4))
      expect(dateIsWithinNextThreeMonths(invalidDate)).toBe(false)
    })

    it('returns false if the date is in the past', () => {
      const pastDate = DateFormats.dateObjToIsoDate(subMonths(new Date(), 1))
      expect(dateIsWithinNextThreeMonths(pastDate)).toBe(false)
    })

    it('returns false if the input is an invalid date string', () => {
      const invalidDateString = 'invalid'
      expect(dateIsWithinNextThreeMonths(invalidDateString)).toBe(false)
    })

    it('returns false if the input is an empty string', () => {
      expect(dateIsWithinNextThreeMonths('')).toBe(false)
    })
  })

  describe('dateIsWithinLastSevenDays', () => {
    it('returns true if the date is within the last 7 days', () => {
      const validDate = DateFormats.dateObjToIsoDate(subDays(new Date(), 5))
      expect(dateIsWithinLastSevenDays(validDate)).toBe(true)
    })

    it('returns false if the date is more than 7 days in the past', () => {
      const invalidDate = DateFormats.dateObjToIsoDate(subDays(new Date(), 8))
      expect(dateIsWithinLastSevenDays(invalidDate)).toBe(false)
    })

    it('returns false if the date is in the future', () => {
      const futureDate = DateFormats.dateObjToIsoDate(addDays(new Date(), 1))
      expect(dateIsWithinLastSevenDays(futureDate)).toBe(false)
    })

    it('returns false if the input is an invalid date string', () => {
      const invalidDateString = 'invalid'
      expect(dateIsWithinLastSevenDays(invalidDateString)).toBe(false)
    })

    it('returns false if the input is an empty string', () => {
      expect(dateIsWithinLastSevenDays('')).toBe(false)
    })
  })
})
