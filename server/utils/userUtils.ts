import { Request } from 'express'
import { ProbationRegion, TemporaryAccommodationUser as User } from '../@types/shared'
import enabledRegions from './enabledRegions'
import config from '../config'

export function filterProbationRegions(regions: ProbationRegion[], request: Request) {
  return [regions.find(region => region.id === request.session.probationRegion.id)]
}

export function isApplyEnabledForUser(user: User): boolean {
  return config.flags.applyEnabledForAllRegions || enabledRegions.includes(user.region.name)
}

export function userHasReferrerRole(user: User): boolean {
  return user.roles.includes('referrer')
}

export function userHasAssessorRole(user: User): boolean {
  return user.roles.includes('assessor')
}

export function userHasReferrerRoleAndIsApplyEnabled(user: User): boolean {
  return userHasReferrerRole(user) && isApplyEnabledForUser(user)
}

export function userHasAssessorRoleAndIsApplyEnabled(user: User): boolean {
  return userHasAssessorRole(user) && isApplyEnabledForUser(user)
}
