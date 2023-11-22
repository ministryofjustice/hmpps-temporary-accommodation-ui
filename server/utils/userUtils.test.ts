import { createMock } from '@golevelup/ts-jest'
import { Request } from 'express'
import { probationRegionFactory, userFactory } from '../testutils/factories'
import {
  filterProbationRegions,
  isApplyEnabledForUser,
  userHasAssessorRole,
  userHasAssessorRoleAndIsApplyEnabled,
  userHasReferrerRole,
  userHasReferrerRoleAndIsApplyEnabled,
  userHasReporterRole,
} from './userUtils'
import { TemporaryAccommodationUserRole as Role } from '../@types/shared'
import config from '../config'

jest.mock('./enabledRegions', () => {
  return ['Kent, Surrey & Sussex']
})

const originalValue = config.flags.applyEnabledForAllRegions

describe('filterProbationRegions', () => {
  it('filters given probation regions by the region on the request session', () => {
    const nonUserRegion1 = probationRegionFactory.build({
      id: 'some-non-user-region-1',
    })
    const nonUserRegion2 = probationRegionFactory.build({
      id: 'some-non-user-region-2',
    })
    const userRegion = probationRegionFactory.build({
      id: 'user-region',
    })

    const request = createMock<Request>()

    request.session.probationRegion = probationRegionFactory.build({ id: 'user-region' })

    expect(filterProbationRegions([nonUserRegion1, userRegion, nonUserRegion2], request)).toEqual([userRegion])
  })
})

describe('isApplyEnabledForUser', () => {
  afterEach(() => {
    config.flags.applyEnabledForAllRegions = originalValue
  })

  it.each([
    [true, 'Kent, Surrey & Sussex', true],
    [true, 'Kent, Surrey & Sussex', false],
    [true, 'London', true],
    [false, 'London', false],
  ])(
    'returns %p when user region is %p and applyEnabledForAllRegions is %p',
    (expected: boolean, regionName: string, applyEnabledForAllRegions: boolean) => {
      config.flags.applyEnabledForAllRegions = applyEnabledForAllRegions
      const user = userFactory.build({ region: { name: regionName } })

      expect(isApplyEnabledForUser(user)).toBe(expected)
    },
  )
})

describe('userHasAssessorRoleAndIsApplyEnabled', () => {
  afterEach(() => {
    config.flags.applyEnabledForAllRegions = originalValue
  })

  it.each([
    [true, 'assessor', 'Kent, Surrey & Sussex'],
    [false, 'referrer', 'Kent, Surrey & Sussex'],
    [true, 'assessor', 'London'],
    [false, 'referrer', 'London'],
  ])(
    'returns %p when the roles are %p and the region is %p for local+dev+test env',
    (expected: boolean, role: Role, regionName: string) => {
      config.flags.applyEnabledForAllRegions = true
      const user = userFactory.build({ roles: [role], region: { name: regionName } })

      expect(userHasAssessorRoleAndIsApplyEnabled(user)).toBe(expected)
    },
  )

  it.each([
    [true, 'assessor', 'Kent, Surrey & Sussex'],
    [false, 'referrer', 'Kent, Surrey & Sussex'],
    [false, 'assessor', 'London'],
    [false, 'referrer', 'London'],
  ])(
    'returns %p when the roles are %p and the region is %p for production env',
    (expected: boolean, role: Role, regionName: string) => {
      config.flags.applyEnabledForAllRegions = false
      const user = userFactory.build({ roles: [role], region: { name: regionName } })

      expect(userHasAssessorRoleAndIsApplyEnabled(user)).toBe(expected)
    },
  )
})

describe('userHasReferrerRole', () => {
  it('returns true when user has got the role "referrer"', () => {
    const user = userFactory.build({ roles: ['referrer'] })
    expect(userHasReferrerRole(user)).toBe(true)
  })

  it('returns false when user hasnt got the role "referrer"', () => {
    const user = userFactory.build({ roles: ['assessor'] })
    expect(userHasReferrerRole(user)).toBe(false)
  })
})

describe('userHasAssessorRole', () => {
  it('returns true when user has got the role "assessor"', () => {
    const user = userFactory.build({ roles: ['assessor'] })
    expect(userHasAssessorRole(user)).toBe(true)
  })

  it('returns false when user hasnt got the role "assessor"', () => {
    const user = userFactory.build({ roles: ['referrer'] })
    expect(userHasAssessorRole(user)).toBe(false)
  })
})

describe('userHasReporterRole', () => {
  it('returns true when user has got the role "reporter"', () => {
    const user = userFactory.build({ roles: ['reporter'] })
    expect(userHasReporterRole(user)).toBe(true)
  })

  it('returns false when user hasnt got the role "reporter"', () => {
    const user = userFactory.build({ roles: ['referrer'] })
    expect(userHasReporterRole(user)).toBe(false)
  })
})

describe('userHasReferrerRoleAndIsApplyEnabled', () => {
  afterEach(() => {
    config.flags.applyEnabledForAllRegions = originalValue
  })

  it.each([
    [true, 'referrer', 'Kent, Surrey & Sussex'],
    [false, 'assessor', 'Kent, Surrey & Sussex'],
    [true, 'referrer', 'London'],
    [false, 'assessor', 'London'],
  ])(
    'returns %p when the roles are %p and the region is %p for local+dev+test env',
    (expected: boolean, role: Role, regionName: string) => {
      config.flags.applyEnabledForAllRegions = true
      const user = userFactory.build({ roles: [role], region: { name: regionName } })

      expect(userHasReferrerRoleAndIsApplyEnabled(user)).toBe(expected)
    },
  )

  it.each([
    [true, 'referrer', 'Kent, Surrey & Sussex'],
    [false, 'assessor', 'Kent, Surrey & Sussex'],
    [false, 'referrer', 'London'],
    [false, 'assessor', 'London'],
  ])(
    'returns %p when the roles are %p and the region is %p for production env',
    (expected: boolean, role: Role, regionName: string) => {
      config.flags.applyEnabledForAllRegions = false
      const user = userFactory.build({ roles: [role], region: { name: regionName } })

      expect(userHasReferrerRoleAndIsApplyEnabled(user)).toBe(expected)
    },
  )
})
