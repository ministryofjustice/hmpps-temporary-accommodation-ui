import { referenceDataFactory, userFactory } from '../../server/testutils/factories'

export default function setupTestUser() {
  cy.task('stubSignIn')
  cy.task('stubAuthUser')

  const probationRegion = referenceDataFactory.probationRegion().build()
  const actingUser = userFactory.build({ region: probationRegion })

  cy.wrap(actingUser).as('actingUser')
  cy.wrap(probationRegion).as('actingUserProbationRegion')

  cy.task('stubActingUser', actingUser)
}
