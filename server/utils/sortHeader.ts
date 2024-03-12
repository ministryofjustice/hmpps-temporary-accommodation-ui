import qs from 'qs'
import { SortDirection } from '../@types/shared'
import { TableCell } from '../@types/ui'
import { createQueryString } from './utils'

export const sortHeader = <T extends string>(
  text: string,
  targetField: T,
  currentSortField: T,
  currentSortAscending: boolean,
  hrefPrefix: string,
): TableCell => {
  let sortDirection: SortDirection
  let ariaSort = 'none'

  const [basePath, queryString] = hrefPrefix.split('?')
  const qsArgs = qs.parse(queryString)

  if (targetField === currentSortField) {
    if (currentSortAscending) {
      sortDirection = 'desc'
      ariaSort = 'ascending'
    } else {
      sortDirection = 'asc'
      ariaSort = 'descending'
    }
  } else {
    ariaSort = 'none'
  }

  return {
    html: `<a href="${basePath}?${createQueryString({
      ...qsArgs,
      page: undefined,
      sortBy: targetField,
      sortDirection,
    })}"><button>${text}</button></a>`,
    attributes: {
      'aria-sort': ariaSort,
      'data-cy-sort-field': targetField,
    },
  }
}
