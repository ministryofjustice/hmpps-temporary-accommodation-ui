/* eslint-disable import/prefer-default-export */
import type { PersonStatus } from 'approved-premises'

const statusTag = (status: PersonStatus): string => {
  if (status === 'InCommunity') {
    return `<strong class="govuk-tag" data-cy-status="${status}">In Community</strong>`
  }

  return `<strong class="govuk-tag" data-cy-status="${status}">In Custody</strong>`
}

export { statusTag }
