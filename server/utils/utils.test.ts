import type { SummaryListItem } from '@approved-premises/ui'
import { createMock } from '@golevelup/ts-jest'
import type { Response } from 'express'
import { risksFactory } from '../testutils/factories'
import {
  appendQueryString,
  camelCase,
  convertToTitleCase,
  exact,
  initialiseName,
  kebabCase,
  lowerCase,
  mapApiPersonRisksForUi,
  normalise,
  notFound,
  pascalCase,
  removeBlankSummaryListItems,
  sentenceCase,
  stripWhitespace,
  unique,
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

describe('pascalCase', () => {
  it('converts a string to Pascal Case', () => {
    expect(pascalCase('my-string')).toEqual('MyString')
  })
})

describe('camelCase', () => {
  it('converts a string to camel Case', () => {
    expect(camelCase('my-string')).toEqual('myString')
  })
})

describe('kebabCase', () => {
  it('converts a string to kebab case', () => {
    expect(kebabCase('My String')).toEqual('my-string')
  })
})

describe('sentenceCase', () => {
  it('converts a string to sentence case', () => {
    expect(sentenceCase('My String')).toEqual('My string')
  })
})

describe('lowerCase', () => {
  it('converts a string to lower case', () => {
    expect(lowerCase('My String')).toEqual('my string')
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

describe('removeBlankSummaryListItems', () => {
  it('removes all blank and undefined items', () => {
    const items = [
      {
        key: {
          text: 'Names',
        },
        value: {
          text: 'Name',
        },
      },
      {
        key: {
          text: 'CRN',
        },
        value: {
          text: '',
        },
      },
      {
        key: {
          text: 'Date of Birth',
        },
        value: {
          text: undefined,
        },
      },
      {
        key: {
          text: 'NOMS Number',
        },
        value: {
          html: '<strong>Some HTML</strong>',
        },
      },
      {
        key: {
          text: 'Nationality',
        },
        value: {
          html: undefined,
        },
      },
      {
        key: {
          text: 'Religion',
        },
        value: {
          html: '',
        },
      },
    ] as Array<SummaryListItem>

    expect(removeBlankSummaryListItems(items)).toEqual([
      {
        key: {
          text: 'Names',
        },
        value: {
          text: 'Name',
        },
      },
      {
        key: {
          text: 'NOMS Number',
        },
        value: {
          html: '<strong>Some HTML</strong>',
        },
      },
    ])
  })
})

describe('mapApiPersonRiskForUI', () => {
  it('returns unmodified person risks', () => {
    const risks = risksFactory.build()
    expect(mapApiPersonRisksForUi(risks)).toEqual(risks)
  })
})

describe('unique', () => {
  it('returns unique elements of an array, compared by ID', () => {
    const input = [
      {
        id: 'abc',
      },
      {
        id: 'xyz',
      },
      {
        id: 'abc',
      },
      {
        id: 'xyz',
      },
      {
        id: 'xyz',
      },
      {
        id: 'efg',
      },
    ]

    expect(unique(input)).toEqual([
      {
        id: 'abc',
      },
      {
        id: 'xyz',
      },
      {
        id: 'efg',
      },
    ])
  })

  describe('exact', () => {
    it('returns a RegExp that only matches the exact given string', () => {
      const regExp = exact('some-string')

      expect(regExp.exec('some-string')).toBeTruthy()
      expect(regExp.exec('some-string-inside-another-string')).toBeFalsy()
      expect(regExp.exec('a-string-containg-some-string')).toBeFalsy()
      expect(regExp.exec('Some-String')).toBeFalsy()
      expect(regExp.exec('some string')).toBeFalsy()
      expect(regExp.exec(' some-string ')).toBeFalsy()
    })

    it('properly escapes special characters', () => {
      const evilString = '.+*?^$()[]{}|\\'

      const regExp = exact(evilString)

      expect(regExp.exec(evilString)).toBeTruthy()
      expect(regExp.exec(evilString.replace('$', '£'))).toBeFalsy()
    })
  })

  describe('appendQueryString', () => {
    it('appends a query string to a given path', () => {
      expect(
        appendQueryString('/some/path', { userId: 'some-user', bookingId: 'some-booking', num: 4, string: '&foo=bar' }),
      ).toEqual('/some/path?userId=some-user&bookingId=some-booking&num=4&string=%26foo%3Dbar')
    })

    it('leaves the string unmodified when the provided data is empty', () => {
      expect(appendQueryString('/some/path', {})).toEqual('/some/path')
    })
  })

  it('appends a query string to a path that already contais a query string', () => {
    expect(appendQueryString('/some/path?userId=some-user', { bookingId: 'some-booking' })).toEqual(
      '/some/path?userId=some-user&bookingId=some-booking',
    )
  })
})

describe('stripWhitespace', () => {
  it('removes whitespace from a string', () => {
    expect(stripWhitespace(' 2034 -   05 - 25  ')).toEqual('2034-05-25')
  })
})

describe('normalise', () => {
  it('capitalises and removes leading and trailing spaces from string', () => {
    expect(normalise('abc123')).toEqual('ABC123')
  })
})

describe('notFound', () => {
  it('should set the status to 404 and render the error page', () => {
    const response = createMock<Response>({})
    notFound(response)

    expect(response.status).toHaveBeenCalledWith(404)
    expect(response.render).toHaveBeenCalledWith('pages/error')
  })
})
