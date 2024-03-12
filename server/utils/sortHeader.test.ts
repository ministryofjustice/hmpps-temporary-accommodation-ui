import { sortHeader } from './sortHeader'
import { createQueryString } from './utils'

type SortHeaders = 'myField' | 'otherField'

describe('sortHeader', () => {
  const hrefPrefix = 'http://localhost/example?'

  it("should return a header when the current view is not sorted by the header's field`", () => {
    expect(sortHeader<SortHeaders>('Some text', 'myField', 'otherField', true, hrefPrefix)).toEqual({
      html: `<a href="${hrefPrefix}${createQueryString({ sortBy: 'myField' })}"><button>Some text</button></a>`,
      attributes: {
        'aria-sort': 'none',
        'data-cy-sort-field': 'myField',
      },
    })
  })

  it("should return a header when the current view is sorted in ascending order by the header's field`", () => {
    expect(sortHeader<SortHeaders>('Some text', 'myField', 'myField', true, hrefPrefix)).toEqual({
      html: `<a href="${hrefPrefix}${createQueryString({
        sortBy: 'myField',
        sortDirection: 'desc',
      })}"><button>Some text</button></a>`,
      attributes: {
        'aria-sort': 'ascending',
        'data-cy-sort-field': 'myField',
      },
    })
  })

  it("should return a header when the current view is sorted in descending order by the header's field`", () => {
    expect(sortHeader<SortHeaders>('Some text', 'myField', 'myField', false, hrefPrefix)).toEqual({
      html: `<a href="${hrefPrefix}${createQueryString({
        sortBy: 'myField',
        sortDirection: 'asc',
      })}"><button>Some text</button></a>`,
      attributes: {
        'aria-sort': 'descending',
        'data-cy-sort-field': 'myField',
      },
    })
  })

  it('should override and replace the existing sorting parameters in the hrefPrefix', () => {
    const prefixWithParams = `${hrefPrefix}sortBy=myField&sortDirection=desc`
    expect(sortHeader<SortHeaders>('Some text', 'myField', 'myField', false, prefixWithParams)).toEqual({
      html: `<a href="${hrefPrefix}${createQueryString({
        sortBy: 'myField',
        sortDirection: 'asc',
      })}"><button>Some text</button></a>`,
      attributes: {
        'aria-sort': 'descending',
        'data-cy-sort-field': 'myField',
      },
    })
  })

  it('should retain any non-sorting-related existing parameters in the hrefPrefix', () => {
    const prefixWithParams = `${hrefPrefix}crn=N999888`
    expect(sortHeader<SortHeaders>('Some text', 'myField', 'myField', false, prefixWithParams)).toEqual({
      html: `<a href="${hrefPrefix}${createQueryString({
        crn: 'N999888',
        sortBy: 'myField',
        sortDirection: 'asc',
      })}"><button>Some text</button></a>`,
      attributes: {
        'aria-sort': 'descending',
        'data-cy-sort-field': 'myField',
      },
    })
  })
})
