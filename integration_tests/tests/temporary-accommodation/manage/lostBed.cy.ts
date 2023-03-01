import setupTestUser from '../../../../cypress_shared/utils/setupTestUser'
import premisesFactory from '../../../../server/testutils/factories/premises'
import roomFactory from '../../../../server/testutils/factories/room'
import lostBedFactory from '../../../../server/testutils/factories/lostBed'
import newLostBedFactory from '../../../../server/testutils/factories/newLostBed'
import BedspaceShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bedspaceShow'
import Page from '../../../../cypress_shared/pages/page'
import LostBedNewPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/lostBedNew'
import LostBedShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/lostBedShow'

context('Lost bed', () => {
  beforeEach(() => {
    cy.task('reset')
    setupTestUser()
  })

  it('navigates to the create void bedspace page', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises and a room the database
    const premises = premisesFactory.build()
    const room = roomFactory.build()

    cy.task('stubSinglePremises', premises)
    cy.task('stubSingleRoom', { premisesId: premises.id, room })

    // When I visit the show bedspace page
    const bedspaceShow = BedspaceShowPage.visit(premises, room)

    // Add I click the void bedspace link
    cy.task('stubLostBedReferenceData')
    bedspaceShow.clickVoidBedspaceLink()

    // Then I navigate to the new lost bed page
    Page.verifyOnPage(LostBedNewPage, premises, room)
  })

  it('navigates to the show void bedspace page', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises, a room, and lost beds the database
    const premises = premisesFactory.build()
    const room = roomFactory.build()
    const lostBeds = lostBedFactory
      .active()
      .params({
        bedId: room.beds[0].id,
      })
      .buildList(5)

    cy.task('stubSinglePremises', premises)
    cy.task('stubSingleRoom', { premisesId: premises.id, room })
    cy.task('stubLostBedsForPremisesId', { premisesId: premises.id, lostBeds })
    cy.task('stubSingleLostBed', { premisesId: premises.id, lostBed: lostBeds[0] })

    // When I visit the show bedspace page
    const bedspaceShowPage = BedspaceShowPage.visit(premises, room)

    // Add I click the lost bed link
    bedspaceShowPage.clickLostBedLink(premises.id, room.id, lostBeds[0].id)

    // Then I navigate to the show lost bed page
    Page.verifyOnPage(LostBedShowPage, premises, room, lostBeds[0])
  })

  it('allows me to create a void booking', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises and a room the database
    const premises = premisesFactory.build()
    const room = roomFactory.build()

    cy.task('stubSinglePremises', premises)
    cy.task('stubSingleRoom', { premisesId: premises.id, room })

    // When I visit the void a bedspace page
    cy.task('stubLostBedReferenceData')
    const page = LostBedNewPage.visit(premises, room)

    // I should see the bedspace details
    page.shouldShowBedspaceDetails()

    // And when I fill out the form
    const lostBed = lostBedFactory.build({
      bedId: room.beds[0].id,
    })

    const newLostBed = newLostBedFactory.build({
      ...lostBed,
      reason: lostBed.reason.id,
      bedId: lostBed.bedId,
    })

    cy.task('stubLostBedCreate', { premisesId: premises.id, lostBed })
    cy.task('stubSingleLostBed', { premisesId: premises.id, lostBed })

    page.completeForm(newLostBed)

    // Then a lost bed should have been created in the API
    cy.task('verifyLostBedCreate', { premisesId: premises.id }).then(requests => {
      expect(requests).to.have.length(1)
      const requestBody = JSON.parse(requests[0].body)

      expect(requestBody.serviceName).equal('temporary-accommodation')
      expect(requestBody.bedId).equal(newLostBed.bedId)
      expect(requestBody.reason).equal(newLostBed.reason)
      expect(requestBody.startDate).equal(newLostBed.startDate)
      expect(requestBody.endDate).equal(newLostBed.endDate)
      expect(requestBody.notes).equal(newLostBed.notes)
    })

    // And I should be redirected to the show booking page
    const lostBedShowPage = Page.verifyOnPage(LostBedShowPage, premises, room, lostBed)
    lostBedShowPage.shouldShowBanner('Void created')
  })

  it('shows errors when the API returns an error', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises and a room the database
    const premises = premisesFactory.build()
    const room = roomFactory.build()

    cy.task('stubSinglePremises', premises)
    cy.task('stubSingleRoom', { premisesId: premises.id, room })

    // When I visit the new lost bed page
    cy.task('stubLostBedReferenceData')
    const page = LostBedNewPage.visit(premises, room)

    // And I miss required fields
    cy.task('stubLostBedErrors', {
      premisesId: premises.id,
      params: ['startDate', 'endDate'],
    })
    page.clickSubmit()

    // Then I should see error messages relating to those fields
    page.shouldShowErrorMessagesForFields(['startDate', 'endDate'])
  })

  it('shows errors when the API returns a 409 conflict error', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises and a room the database
    const premises = premisesFactory.build()
    const room = roomFactory.build()

    cy.task('stubSinglePremises', premises)
    cy.task('stubSingleRoom', { premisesId: premises.id, room })

    // When I visit the new lost bed page
    cy.task('stubLostBedReferenceData')
    const page = LostBedNewPage.visit(premises, room)

    // And I fill out the form with dates that conflict with an existing lost bed
    const lostBed = lostBedFactory.build({
      bedId: room.beds[0].id,
    })
    const newLostBed = newLostBedFactory.build({
      ...lostBed,
      reason: lostBed.reason.id,
    })

    cy.task('stubLostBedCreateConflictError', premises.id)

    page.completeForm(newLostBed)

    // Then I should see error messages for the date fields
    page.shouldShowDateConflictErrorMessages()
  })

  it('navigates back from the new lost bed page to the show bedspace page', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises and a room the database
    const premises = premisesFactory.build()
    const room = roomFactory.build()

    cy.task('stubSinglePremises', premises)
    cy.task('stubSingleRoom', { premisesId: premises.id, room })

    // When I visit the new lost bed page
    cy.task('stubLostBedReferenceData')
    const page = LostBedNewPage.visit(premises, room)

    // And I click the previous bread crumb
    page.clickBreadCrumbUp()

    // Then I navigate to the show bedspace page
    Page.verifyOnPage(BedspaceShowPage, premises, room)
  })

  it('shows a single lost bed', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises, a room, and a lost bed in the database
    const premises = premisesFactory.build()
    const room = roomFactory.build()
    const lostBed = lostBedFactory.build()

    cy.task('stubSinglePremises', premises)
    cy.task('stubSingleRoom', { premisesId: premises.id, room })
    cy.task('stubSingleLostBed', { premisesId: premises.id, lostBed })

    // When I visit the show lost bed page
    const page = LostBedShowPage.visit(premises, room, lostBed)

    // Then I should see the booking details
    page.shouldShowLostBedDetails()
  })

  it('navigates back from the show lost bed page to the show bedspace page', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises, a room, and lost beds in the database
    const premises = premisesFactory.build()
    const room = roomFactory.build()
    const lostBeds = lostBedFactory
      .params({
        bedId: room.beds[0].id,
      })
      .buildList(5)

    cy.task('stubSinglePremises', premises)
    cy.task('stubSingleRoom', { premisesId: premises.id, room })
    cy.task('stubLostBedsForPremisesId', { premisesId: premises.id, lostBeds })
    cy.task('stubSingleLostBed', { premisesId: premises.id, lostBed: lostBeds[0] })

    // When I visit the show lost bed page
    const page = LostBedShowPage.visit(premises, room, lostBeds[0])

    // And I click the previous bread crumb
    page.clickBreadCrumbUp()

    // Then I navigate to the show bedspace page
    Page.verifyOnPage(BedspaceShowPage, premises, room)
  })
})
