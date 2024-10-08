import { createMock } from '@golevelup/ts-jest'

import type { ErrorMessages } from '@approved-premises/ui'
import {
  convertArrayToRadioItems,
  convertKeyValuePairToCheckBoxItems,
  convertKeyValuePairToRadioItems,
  convertKeyValuePairsToSummaryListItems,
  convertObjectsToCheckboxItems,
  convertObjectsToRadioItems,
  convertObjectsToSelectOptions,
  dateFieldValues,
  flattenCheckboxInput,
  isStringOrArrayOfStrings,
  parseNumber,
  validPostcodeArea,
} from './formUtils'

describe('formUtils', () => {
  describe('dateFieldValues', () => {
    it('returns items with an error class when errors are present for the field', () => {
      const errors = createMock<ErrorMessages>({
        myField: {
          text: 'Some error message',
        },
      })
      const context = {
        'myField-day': 12,
        'myField-month': 11,
        'myField-year': 2022,
      }
      const fieldName = 'myField'

      expect(dateFieldValues(fieldName, context, errors)).toEqual([
        {
          classes: 'govuk-input--width-2 govuk-input--error',
          name: 'day',
          value: context['myField-day'],
        },
        {
          classes: 'govuk-input--width-2 govuk-input--error',
          name: 'month',
          value: context['myField-month'],
        },
        {
          classes: 'govuk-input--width-4 govuk-input--error',
          name: 'year',
          value: context['myField-year'],
        },
      ])
    })

    it('returns items without an error class when no errors are present for the field', () => {
      const errors = createMock<ErrorMessages>({
        someOtherField: {
          text: 'Some error message',
        },
        myField: undefined,
      })
      const context = {
        'myField-day': 12,
        'myField-month': 11,
        'myField-year': 2022,
      }
      const fieldName = 'myField'

      expect(dateFieldValues(fieldName, context, errors)).toEqual([
        {
          classes: 'govuk-input--width-2 ',
          name: 'day',
          value: context['myField-day'],
        },
        {
          classes: 'govuk-input--width-2 ',
          name: 'month',
          value: context['myField-month'],
        },
        {
          classes: 'govuk-input--width-4 ',
          name: 'year',
          value: context['myField-year'],
        },
      ])
    })
  })

  describe('convertObjectsToRadioItems', () => {
    const objects = [
      {
        id: '123',
        name: 'abc',
      },
      {
        id: '345',
        name: 'def',
      },
    ]

    it('converts objects to an array of radio items', () => {
      const result = convertObjectsToRadioItems(objects, 'name', 'id', 'field', {})

      expect(result).toEqual([
        {
          text: 'abc',
          value: '123',
          checked: false,
        },
        {
          text: 'def',
          value: '345',
          checked: false,
        },
      ])
    })

    it('marks objects that are in the context as checked', () => {
      const result = convertObjectsToRadioItems(objects, 'name', 'id', 'field', { field: '123' })

      expect(result).toEqual([
        {
          text: 'abc',
          value: '123',
          checked: true,
        },
        {
          text: 'def',
          value: '345',
          checked: false,
        },
      ])
    })

    it('adds conditional reveals to items with matching text', () => {
      const result = convertObjectsToRadioItems(objects, 'name', 'id', 'field', {}, [
        {
          match: 'def',
          html: '<p>Conditional HTML</p>',
        },
      ])

      expect(result).toEqual([
        {
          text: 'abc',
          value: '123',
          checked: false,
        },
        {
          text: 'def',
          value: '345',
          checked: false,
          conditional: {
            html: '<p>Conditional HTML</p>',
          },
        },
      ])
    })
  })

  describe('convertKeyValuePairToCheckBoxItems', () => {
    const obj = {
      foo: 'Foo',
      bar: 'Bar',
    }

    it('should convert a key value pair to checkbox items', () => {
      expect(convertKeyValuePairToCheckBoxItems(obj, [])).toEqual([
        {
          value: 'foo',
          text: 'Foo',
          checked: false,
        },
        {
          value: 'bar',
          text: 'Bar',
          checked: false,
        },
      ])
    })

    it('should handle an undefined checkedItems value', () => {
      expect(convertKeyValuePairToCheckBoxItems(obj, undefined)).toEqual([
        {
          value: 'foo',
          text: 'Foo',
          checked: false,
        },
        {
          value: 'bar',
          text: 'Bar',
          checked: false,
        },
      ])
    })

    it('should check the checked item', () => {
      expect(convertKeyValuePairToCheckBoxItems(obj, ['foo'])).toEqual([
        {
          value: 'foo',
          text: 'Foo',
          checked: true,
        },
        {
          value: 'bar',
          text: 'Bar',
          checked: false,
        },
      ])

      expect(convertKeyValuePairToCheckBoxItems(obj, ['bar'])).toEqual([
        {
          value: 'foo',
          text: 'Foo',
          checked: false,
        },
        {
          value: 'bar',
          text: 'Bar',
          checked: true,
        },
      ])

      expect(convertKeyValuePairToCheckBoxItems(obj, ['foo', 'bar'])).toEqual([
        {
          value: 'foo',
          text: 'Foo',
          checked: true,
        },
        {
          value: 'bar',
          text: 'Bar',
          checked: true,
        },
      ])
    })
  })

  describe('convertKeyValuePairToRadioItems', () => {
    const obj = {
      foo: 'Foo',
      bar: 'Bar',
    }

    it('should convert a key value pair to radio items', () => {
      expect(convertKeyValuePairToRadioItems(obj, '')).toEqual([
        {
          value: 'foo',
          text: 'Foo',
          checked: false,
        },
        {
          value: 'bar',
          text: 'Bar',
          checked: false,
        },
      ])
    })

    it('should check the checked item', () => {
      expect(convertKeyValuePairToRadioItems(obj, 'foo')).toEqual([
        {
          value: 'foo',
          text: 'Foo',
          checked: true,
        },
        {
          value: 'bar',
          text: 'Bar',
          checked: false,
        },
      ])

      expect(convertKeyValuePairToRadioItems(obj, 'bar')).toEqual([
        {
          value: 'foo',
          text: 'Foo',
          checked: false,
        },
        {
          value: 'bar',
          text: 'Bar',
          checked: true,
        },
      ])
    })
  })

  describe('convertObjectsToSelectOptions', () => {
    const objects = [
      {
        id: '123',
        name: 'abc',
      },
      {
        id: '345',
        name: 'def',
      },
    ]

    it('converts objects to an array of select options', () => {
      const result = convertObjectsToSelectOptions(objects, 'Select a keyworker', 'name', 'id', 'field', {})

      expect(result).toEqual([
        {
          value: '',
          text: 'Select a keyworker',
          selected: true,
        },
        {
          text: 'abc',
          value: '123',
          selected: false,
        },
        {
          text: 'def',
          value: '345',
          selected: false,
        },
      ])
    })

    it('marks the object that is in the context as selected', () => {
      const result = convertObjectsToSelectOptions(objects, 'Select a keyworker', 'name', 'id', 'field', {
        field: '123',
      })

      expect(result).toEqual([
        {
          value: '',
          text: 'Select a keyworker',
          selected: false,
        },
        {
          text: 'abc',
          value: '123',
          selected: true,
        },
        {
          text: 'def',
          value: '345',
          selected: false,
        },
      ])
    })
  })

  describe('convertObjectsToCheckboxItems', () => {
    const objects = [
      {
        id: '123',
        name: 'abc',
      },
      {
        id: '345',
        name: 'def',
      },
    ]

    it('converts objects to an array of select options', () => {
      const result = convertObjectsToCheckboxItems(objects, 'name', 'id', 'field', {})

      expect(result).toEqual([
        {
          text: 'abc',
          value: '123',
          checked: false,
        },
        {
          text: 'def',
          value: '345',
          checked: false,
        },
      ])
    })

    it('marks the objects that are in the passed IDs as checked', () => {
      const result = convertObjectsToCheckboxItems(objects, 'name', 'id', 'field', { field: ['345'] })

      expect(result).toEqual([
        {
          text: 'abc',
          value: '123',
          checked: false,
        },
        {
          text: 'def',
          value: '345',
          checked: true,
        },
      ])
    })
  })

  describe('validPostcodeArea', () => {
    it('when passed a postcode area it returns true', () => {
      expect(validPostcodeArea('HR1')).toBe(true)
    })

    it('when passed a lowercase postcode area it returns true', () => {
      expect(validPostcodeArea('hr1')).toBe(true)
    })

    it('when passed a non-postcode string returns false', () => {
      expect(validPostcodeArea('foo')).toBe(false)
    })
  })

  describe('flattenCheckboxInput', () => {
    it('returns the input in an array', () => {
      expect(flattenCheckboxInput('test')).toEqual(['test'])
    })
    it('returns the input if it is already an array', () => {
      expect(flattenCheckboxInput(['test'])).toEqual(['test'])
    })
    it('returns an empty array if the value is falsy', () => {
      expect(flattenCheckboxInput(null)).toEqual([])
    })
  })

  describe('isStringOrArrayOfStrings', () => {
    it('returns true if the input is a string', () => {
      expect(isStringOrArrayOfStrings('test')).toEqual(true)
    })
    it('returns true if the input is an array of strings', () => {
      expect(isStringOrArrayOfStrings(['test', 'test'])).toEqual(true)
    })
    it('returns false if array contains a non-string value ', () => {
      expect(isStringOrArrayOfStrings(['test', 1, 'test'])).toEqual(false)
    })
  })

  describe('convertArrayToRadioItems', () => {
    it('returns the array as radio items with the value in sentence case', () => {
      expect(convertArrayToRadioItems(['one', 'two'], 'two')).toEqual([
        { text: 'One', value: 'one', checked: false },
        { text: 'Two', value: 'two', checked: true },
      ])
    })
  })

  describe('convertKeyValuePairsToSummaryListItems', () => {
    it('returns the key value pairs as summary list items', () => {
      expect(convertKeyValuePairsToSummaryListItems({ itemOne: 'someValue' }, { itemOne: 'First title' })).toEqual([
        {
          key: {
            text: 'First title',
          },
          value: {
            text: 'someValue',
          },
        },
      ])
    })
  })

  describe('parseNumber', () => {
    it('returns undefined when given an empty string', () => {
      expect(parseNumber('')).toBeUndefined()
    })

    it('returns undefined when given undefined', () => {
      expect(parseNumber(undefined)).toBeUndefined()
    })

    it('trims the input', () => {
      expect(parseNumber('   ')).toBeUndefined()
    })

    describe('with default options', () => {
      it.each([
        ['a non-numeric string', 'fourteen'],
        ['a number with spaces', '34 56'],
        ['an exponential', '10e10'],
        ['a negative', '-5'],
        ['a decimal', '8.1'],
        ['a negative decimal', '-6.55'],
      ])('does not attempt to parse %s', (_, input) => {
        expect(parseNumber(input)).toBeNaN()
      })

      it.each([
        ['a positive number string', '123', 123],
        ['a positive number with whitespace around', '  345 ', 345],
        ['a positive number with leading zero', '067', 67],
        ['a number type', 321, 321],
      ])('returns a number when given %s', (_, input, expected) => {
        expect(parseNumber(input)).toEqual(expected)
      })
    })

    describe('when allowing negative numbers', () => {
      it('returns a number when given a negative', () => {
        expect(parseNumber('-5', { allowNegatives: true })).toEqual(-5)
      })
    })

    describe('when allowing decimals', () => {
      it('returns a number when given a decimal', () => {
        expect(parseNumber('7.89', { allowDecimals: true })).toEqual(7.89)
      })
    })

    describe('when allowing negative numbers and decimals', () => {
      it('returns a number when given a negative decimal', () => {
        expect(parseNumber('-124.5', { allowNegatives: true, allowDecimals: true })).toEqual(-124.5)
      })
    })
  })
})
