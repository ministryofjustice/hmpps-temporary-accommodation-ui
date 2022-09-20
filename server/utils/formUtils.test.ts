import { createMock } from '@golevelup/ts-jest'

import type { ErrorMessages } from 'approved-premises'
import {
  dateFieldValues,
  convertObjectsToRadioItems,
  convertKeyValuePairToRadioItems,
  convertObjectsToSelectOptions,
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
      const result = convertObjectsToSelectOptions(objects, 'name', 'id', 'field', {})

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
      const result = convertObjectsToSelectOptions(objects, 'name', 'id', 'field', { field: '123' })

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
})
