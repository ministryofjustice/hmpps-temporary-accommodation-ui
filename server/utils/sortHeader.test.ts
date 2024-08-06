import { sortHeader } from './sortHeader'
import { createQueryString } from './utils'

type SortHeaders = 'myField' | 'otherField'

describe('sortHeader', () => {
  const hrefPrefix = 'http://localhost/example?'

  describe('when the current view is sorted by another field', () => {
    it('should return a header to sort by this field ascending', () => {
      const header = sortHeader<SortHeaders>('Some text', 'myField', 'otherField', false, hrefPrefix)

      expect(header).toEqual({
        html: `<a href="${hrefPrefix}${createQueryString({
          sortBy: 'myField',
          sortDirection: 'asc',
        })}"><button>Some text</button></a>`,
        attributes: { 'aria-sort': 'none' },
      })
    })
  })

  describe('when the current view is sorted by this field ascending', () => {
    it('should return a header to sort by this field descending', () => {
      const header = sortHeader<SortHeaders>('Some text', 'myField', 'myField', true, hrefPrefix)

      expect(header).toEqual({
        html: `<a href="${hrefPrefix}${createQueryString({
          sortBy: 'myField',
          sortDirection: 'desc',
        })}"><button>Some text</button></a>`,
        attributes: { 'aria-sort': 'ascending' },
      })
    })
  })

  describe('when the current view is sorted by this field descending', () => {
    it('should return a header to sort by this field ascending', () => {
      const header = sortHeader<SortHeaders>('Some text', 'myField', 'myField', false, hrefPrefix)

      expect(header).toEqual({
        html: `<a href="${hrefPrefix}${createQueryString({
          sortBy: 'myField',
          sortDirection: 'asc',
        })}"><button>Some text</button></a>`,
        attributes: { 'aria-sort': 'descending' },
      })
    })
  })

  it('should override and replace the existing sorting parameters in the hrefPrefix', () => {
    const prefixWithParams = `${hrefPrefix}sortBy=myField&sortDirection=desc`

    const header = sortHeader<SortHeaders>('Some text', 'myField', 'myField', false, prefixWithParams)

    expect(header).toEqual({
      html: `<a href="${hrefPrefix}${createQueryString({
        sortBy: 'myField',
        sortDirection: 'asc',
      })}"><button>Some text</button></a>`,
      attributes: { 'aria-sort': 'descending' },
    })
  })

  it('should retain any non-sorting-related existing parameters in the hrefPrefix apart from page', () => {
    const prefixWithParams = `${hrefPrefix}crn=N999888&page=13`

    const header = sortHeader<SortHeaders>('Some text', 'myField', 'myField', false, prefixWithParams)

    expect(header).toEqual({
      html: `<a href="${hrefPrefix}${createQueryString({
        crn: 'N999888',
        sortBy: 'myField',
        sortDirection: 'asc',
      })}"><button>Some text</button></a>`,
      attributes: { 'aria-sort': 'descending' },
    })
  })
})
