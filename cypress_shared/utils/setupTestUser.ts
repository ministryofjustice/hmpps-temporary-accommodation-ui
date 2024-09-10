import { TemporaryAccommodationUserRole as UserRole } from '../../server/@types/shared'
import { referenceDataFactory, userFactory, userProfileFactory } from '../../server/testutils/factories'

export function setupTestUser(role: UserRole) {
  setupTestWithRoles([role])
}

export function setupTestUserWithoutRole() {
  setupTestWithRoles([])
}

function setupTestWithRoles(roles: Array<UserRole>) {
  cy.task('stubSignIn')

  const probationRegion = referenceDataFactory.probationRegion().build()
  const actingUser = userFactory.build({
    name: 'john smith',
    region: probationRegion,
    roles,
    telephoneNumber: undefined,
  })
  const userProfile = userProfileFactory.build({ user: actingUser })

  cy.wrap(actingUser).as('actingUser')
  cy.wrap(probationRegion).as('actingUserProbationRegion')

  cy.task('stubUserProfile', userProfile)
}
