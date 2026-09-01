import type { PersonStatus } from '@approved-premises/ui'
import { FullPerson, FullPersonSummary, Person, PersonSummary } from '../@types/shared'

const statusTag = (status: PersonStatus): string => {
  if (status === 'InCommunity') {
    return `<strong class="govuk-tag" data-cy-status="${status}">In community</strong>`
  }

  return `<strong class="govuk-tag" data-cy-status="${status}">In custody</strong>`
}

const tierBadge = (tier: string): string => {
  if (!tier) return ''

  const colour = { A: 'moj-badge--red', B: 'moj-badge--purple' }[tier[0]]

  return `<span class="moj-badge ${colour}">${tier}</span>`
}

const personNameFallback = 'the person'

const personName = (person: Person | PersonSummary, fallback: string = personNameFallback) => {
  if (isFullPerson(person)) {
    return person.name
  }
  return fallback
}

const isFullPerson = (person?: Person | PersonSummary): person is FullPerson | FullPersonSummary =>
  (person as FullPerson)?.type === 'FullPerson' || (person as FullPersonSummary)?.personType === 'FullPersonSummary'

export { isFullPerson, personName, personNameFallback, statusTag, tierBadge }
