import { TemporaryAccommodationUserRole as UserRole } from '../../server/@types/shared'
import { referenceDataFactory, userFactory } from '../../server/testutils/factories'

export function setupTestUser(role: UserRole) {
  setupTestWithRoles([role])
}

export function setupTestUserWithoutRole() {
  setupTestWithRoles([])
}

function setupTestWithRoles(roles: Array<UserRole>) {
  cy.task('stubSignIn')

  const probationRegion = referenceDataFactory.probationRegion().build()
  const actingUser = userFactory.build({ name: 'john smith', region: probationRegion, roles })

  cy.wrap(actingUser).as('actingUser')
  cy.wrap(probationRegion).as('actingUserProbationRegion')

  cy.task('stubActingUser', actingUser)
  cy.task('stubGetUserById', actingUser)
}
