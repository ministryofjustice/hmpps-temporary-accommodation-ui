import PlaceHelper from '../../../cypress_shared/helpers/place'
import { setupTestUser } from '../../../cypress_shared/utils/setupTestUser'
import { placeContextFactory, premisesFactory, roomFactory } from '../../../server/testutils/factories'

context('Place', () => {
  beforeEach(() => {
    cy.task('reset')
    setupTestUser('assessor')
  })

  it('allows the user progress along the "place" joureny', () => {
    // Given I am signed in
    cy.signIn()

    const premises = premisesFactory.active().build()
    const room = roomFactory.build()

    const placeContext = placeContextFactory.build()
    const placeHelper = new PlaceHelper(placeContext, premises, room)
    placeHelper.setupStubs()

    // And I am at the start of the "place" journey
    placeHelper.startPlace()

    // I can complete the "place" journey
    placeHelper.completePlace()
  })
})
