import referenceData from '../../server/testutils/factories/referenceData'
import userFactory from '../../server/testutils/factories/user'

export default function stubActingUser() {
  const probationRegion = referenceData.probationRegion().build()
  const actingUser = userFactory.build({ region: probationRegion })

  cy.wrap(actingUser).as('actingUser')
  cy.wrap(probationRegion).as('actingUserProbationRegion')

  cy.task('stubActingUser', actingUser)
}
