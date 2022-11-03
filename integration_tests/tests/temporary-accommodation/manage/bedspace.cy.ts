import premisesFactory from '../../../../server/testutils/factories/premises'
import newRoomFactory from '../../../../server/testutils/factories/newRoom'
import roomFactory from '../../../../server/testutils/factories/room'
import PremisesNewPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/premisesNew'
import Page from '../../../../cypress_shared/pages/page'
import PremisesShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/premisesShow'
import BedspaceNewPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bedspaceNew'

context('Bedspace', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
  })

  it('allows me to create a bedspace', () => {
    // Given I am signed in
    cy.signIn()

    // When I visit the new bedspace page
    cy.task('stubCharacteristicsReferenceData')

    const premises = premisesFactory.build()
    cy.task('stubSinglePremises', premises)

    const page = BedpsaceNewPage.visit(premises.id)

    // And I fill out the form
    const room = roomFactory.build()
    const newRoom = newRoomFactory.build({
      name: room.name,
      characteristicIds: room.characteristics.map(characteristic => characteristic.id),
      notes: room.notes,
    })
    cy.task('stubRoomCreate', { premisesId: premises.id, room })

    page.completeForm(newRoom)

    // Then a room should have been created in the API
    cy.task('verifyRoomCreate', premises.id).then(requests => {
      expect(requests).to.have.length(1)
      const requestBody = JSON.parse(requests[0].body)

      expect(requestBody.name).equal(newRoom.name)
      expect(requestBody.characteristicIds).members(newRoom.characteristicIds)
      expect(requestBody.notes.replaceAll('\r\n', '\n')).equal(newRoom.notes)
    })

    // And I should be redirected to the show premises page
    const premisesNewPage = PremisesNewPage.verifyOnPage(PremisesShowPage, premises)
    premisesNewPage.shouldShowBanner('Bedspace created')
  })

  it('shows errors when the API returns an error', () => {
    // Given I am signed in
    cy.signIn()

    // When I visit the new bedspace page
    cy.task('stubCharacteristicsReferenceData')

    const premises = premisesFactory.build()
    const page = BedspaceNewPage.visit(premises.id)

    // And I miss required fields
    cy.task('stubRoomCreateErrors', { premisesId: premises.id, params: ['name'] })
    page.clickSubmit()

    // Then I should see error messages relating to those fields
    page.shouldShowErrorMessagesForFields(['name'])
  })

  it('should navigate back from the new bedspace page to the show premises page', () => {
    // Given I am signed in
    cy.signIn()

    // When I visit the new bedspace page
    cy.task('stubCharacteristicsReferenceData')

    const premises = premisesFactory.build()
    cy.task('stubSinglePremises', premises)

    const page = BedspaceNewPage.visit(premises.id)

    // And I click the previous bread crumb
    page.clickBreadCrumbUp()

    // Then I navigate to the show premises page
    Page.verifyOnPage(PremisesShowPage, premises)
  })
})
