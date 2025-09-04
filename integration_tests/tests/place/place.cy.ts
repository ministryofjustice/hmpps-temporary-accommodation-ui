import { faker } from '@faker-js/faker/locale/en'
import PlaceHelper from '../../../cypress_shared/helpers/place'
import { setupTestUser } from '../../../cypress_shared/utils/setupTestUser'
import {
  cas3BedspaceFactory,
  cas3PremisesFactory,
  placeContextFactory,
  premisesFactory,
} from '../../../server/testutils/factories'

context('Place', () => {
  beforeEach(() => {
    cy.task('reset')
    setupTestUser('assessor')
  })

  it('allows the user progress along the "place" journey', () => {
    // Given I am signed in
    cy.signIn()

    const premisesId = faker.string.uuid()
    const bedspaceId = faker.string.uuid()
    const premises = premisesFactory.active().build({ id: premisesId, name: 'Test premises' })
    const cas3Premises = cas3PremisesFactory.build({ id: premisesId, status: 'online', reference: 'Test premises' })
    const cas3Bedspace = cas3BedspaceFactory.build({ id: bedspaceId, reference: 'Test bedspace', status: 'online' })
    const placeContext = placeContextFactory.build()
    const placeHelper = new PlaceHelper(placeContext, premises, cas3Premises, cas3Bedspace)
    placeHelper.setupStubs()

    // And I am at the start of the "place" journey
    placeHelper.startPlace()

    // I can complete the "place" journey
    placeHelper.completePlace()
  })
})
