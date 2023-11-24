import { TemporaryAccommodationUserRole as UserRole } from '../../server/@types/shared'
import { referenceDataFactory, userFactory } from '../../server/testutils/factories'

export function setupTestUser(role: UserRole, regionConfig?) {
  setupTestWithRoles([role], regionConfig)
}

export function setupTestUserWithoutRole() {
  setupTestWithRoles([])
}

function setupTestWithRoles(roles: Array<UserRole>, regionConfig?) {
  cy.task('stubSignIn')
  cy.task('stubAuthUser')

  const probationRegion = referenceDataFactory.probationRegion().build({ config: regionConfig })

  const actingUser = userFactory.build({ region: probationRegion, roles })

  cy.wrap(actingUser).as('actingUser')
  cy.wrap(probationRegion).as('actingUserProbationRegion')

  cy.task('stubActingUser', actingUser)
  cy.task('stubGetUserById', actingUser)
}
