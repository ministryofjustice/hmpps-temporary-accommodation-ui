import qs from 'qs'
import { createQueryString } from './utils'

export type PaginationPreviousOrNext = {
  href?: string
  text?: string
}

export type PaginationItem =
  | {
      text?: string
      href?: string
      selected?: boolean
    }
  | {
      type: 'dots'
    }

export type Pagination = {
  previous?: PaginationPreviousOrNext
  items?: Array<PaginationItem>
  next?: PaginationPreviousOrNext
  landmarkLabel?: string
}

/**
 * Produces parameters for the MoJ Pagination component macro
 * https://design-patterns.service.justice.gov.uk/components/pagination/
 * NB: `page` starts at 1
 */
export function pagination(currentPage: number, pageCount: number, hrefPrefix: string): Pagination {
  const params: Pagination = {}

  const [basePath, queryString] = hrefPrefix.split('?')
  const qsArgs = qs.parse(queryString)
  const genUrl = (page: number) => `${basePath}?${createQueryString({ ...qsArgs, page })}`

  if (!pageCount || pageCount <= 1) {
    return params
  }

  if (currentPage > 1) {
    params.previous = {
      text: 'Previous',
      href: genUrl(currentPage - 1),
    }
  }
  if (currentPage < pageCount) {
    params.next = {
      text: 'Next',
      href: genUrl(currentPage + 1),
    }
  }

  let pages: Array<number | null>
  if (currentPage >= 5) {
    pages = [1, 2, null, currentPage - 1, currentPage]
  } else {
    pages = [1, 2, 3, 4].slice(0, currentPage)
  }
  const maxPage = Math.max(currentPage, pages.at(-1))
  if (maxPage === pageCount - 1) {
    pages.push(pageCount)
  } else if (maxPage === pageCount - 2) {
    pages.push(pageCount - 1, pageCount)
  } else if (maxPage === pageCount - 3) {
    pages.push(maxPage + 1, pageCount - 1, pageCount)
  } else if (maxPage <= pageCount - 4) {
    pages.push(maxPage + 1, null, pageCount - 1, pageCount)
  }

  params.items = pages.map((somePage: number | null): PaginationItem => {
    if (somePage) {
      const item: PaginationItem = {
        text: somePage.toString(),
        href: genUrl(somePage),
      }
      if (somePage === currentPage) {
        item.selected = true
      }
      return item
    }
    return { type: 'dots' }
  })

  return params
}
