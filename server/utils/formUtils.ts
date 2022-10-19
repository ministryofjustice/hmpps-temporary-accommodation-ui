import type { ErrorMessages, RadioItem, CheckBoxItem, SelectOption } from '@approved-premises/ui'

export const dateFieldValues = (fieldName: string, context: Record<string, unknown>, errors: ErrorMessages = {}) => {
  const errorClass = errors[fieldName] ? 'govuk-input--error' : ''
  return [
    {
      classes: `govuk-input--width-2 ${errorClass}`,
      name: 'day',
      value: context[`${fieldName}-day`],
    },
    {
      classes: `govuk-input--width-2 ${errorClass}`,
      name: 'month',
      value: context[`${fieldName}-month`],
    },
    {
      classes: `govuk-input--width-4 ${errorClass}`,
      name: 'year',
      value: context[`${fieldName}-year`],
    },
  ]
}

export const convertObjectsToRadioItems = (
  items: Array<Record<string, string>>,
  textKey: string,
  valueKey: string,
  fieldName: string,
  context: Record<string, unknown>,
): Array<RadioItem> => {
  return items.map(item => {
    return {
      text: item[textKey],
      value: item[valueKey],
      checked: context[fieldName] === item[valueKey],
    }
  })
}

export const convertObjectsToSelectOptions = (
  items: Array<Record<string, string>>,
  prompt: string,
  textKey: string,
  valueKey: string,
  fieldName: string,
  context: Record<string, unknown>,
): Array<SelectOption> => {
  const options = [
    {
      value: '',
      text: prompt,
      selected: !context[fieldName] || context[fieldName] === '',
    },
  ]

  items.forEach(item => {
    options.push({
      text: item[textKey],
      value: item[valueKey],
      selected: context[fieldName] === item[valueKey],
    })
  })

  return options
}

export function convertKeyValuePairToRadioItems<T>(object: T, checkedItem: string): Array<RadioItem> {
  return Object.keys(object).map(key => {
    return {
      value: key,
      text: object[key],
      checked: checkedItem === key,
    }
  })
}

export function convertKeyValuePairToCheckBoxItems<T>(
  object: T,
  checkedItems: Array<string> = [],
): Array<CheckBoxItem> {
  return Object.keys(object).map(key => {
    return {
      value: key,
      text: object[key],
      checked: checkedItems.includes(key),
    }
  })
}
