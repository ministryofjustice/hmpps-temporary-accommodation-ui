import type { PersonStatus } from '@approved-premises/ui'
import { FullPerson, Person } from '../@types/shared'

const statusTag = (status: PersonStatus): string => {
  if (status === 'InCommunity') {
    return `<strong class="govuk-tag" data-cy-status="${status}">In Community</strong>`
  }

  return `<strong class="govuk-tag" data-cy-status="${status}">In Custody</strong>`
}

const tierBadge = (tier: string): string => {
  if (!tier) return ''

  const colour = { A: 'moj-badge--red', B: 'moj-badge--purple' }[tier[0]]

  return `<span class="moj-badge ${colour}">${tier}</span>`
}

const isApplicableTier = (sex: string, tier: string): boolean => {
  const applicableTiersAll = ['A3', 'A2', 'B1', 'B3', 'B2', 'B1']
  const applicableTiersWomen = ['C3']

  const applicableTiers = sex === 'Female' ? [applicableTiersAll, applicableTiersWomen].flat() : applicableTiersAll

  return applicableTiers.includes(tier)
}

const personNameFallback = 'the person'

const personName = (person: Person, fallback: string = personNameFallback) => {
  if (isFullPerson(person)) {
    return person.name
  }
  return fallback
}

const isFullPerson = (person: Person): person is FullPerson => {
  return person.type === 'FullPerson'
}

export { isApplicableTier, isFullPerson, personName, personNameFallback, statusTag, tierBadge }
