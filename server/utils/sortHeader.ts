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
  const sortDirection: SortDirection = currentSortAscending && currentSortField === targetField ? 'desc' : 'asc'
  let ariaSort: string = 'none'

  if (targetField === currentSortField) {
    if (currentSortAscending) {
      ariaSort = 'ascending'
    } else {
      ariaSort = 'descending'
    }
  }

  const [basePath, queryString] = hrefPrefix.split('?')

  const qsArgs = qs.parse(queryString)

  return {
    html: `<a href="${basePath}?${createQueryString({
      ...qsArgs,
      page: undefined,
      sortBy: targetField,
      sortDirection,
    })}"><button>${text}</button></a>`,
    attributes: {
      'aria-sort': ariaSort,
    },
  }
}
