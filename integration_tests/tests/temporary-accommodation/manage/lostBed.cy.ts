import Page from '../../../../cypress_shared/pages/page'
import BedspaceShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bedspaceShow'
import LostBedCancelPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/lostBedCancel'
import LostBedEditPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/lostBedEdit'
import LostBedNewPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/lostBedNew'
import LostBedShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/lostBedShow'
import { setupTestUser } from '../../../../cypress_shared/utils/setupTestUser'
import {
  bedFactory,
  bookingFactory,
  cas3BedspaceFactory,
  cas3PremisesFactory,
  lostBedFactory,
  newLostBedCancellationFactory,
  newLostBedFactory,
  premisesFactory,
  updateLostBedFactory,
} from '../../../../server/testutils/factories'

context('Lost bed', () => {
  beforeEach(() => {
    cy.task('reset')
    setupTestUser('assessor')
  })

  it('navigates to the create void bedspace page', () => {
    // Given I am signed in
    cy.signIn()

    // And there is an active premises and a bedspace the database
    const premises = premisesFactory.active().build()
    const cas3Premises = cas3PremisesFactory.build({ id: premises.id, status: 'online' })
    const bedspace = cas3BedspaceFactory.build({ status: 'online', startDate: '2023-10-18' })
    const bookings = bookingFactory
      .params({
        bed: bedFactory.build({ id: bedspace.id }),
      })
      .buildList(5)
    const lostBeds = lostBedFactory
      .active()
      .params({
        bedId: bedspace.id,
      })
      .buildList(5)

    cy.task('stubSinglePremises', premises)
    cy.task('stubSinglePremisesV2', cas3Premises)
    cy.task('stubBedspaceV2', { premisesId: cas3Premises.id, bedspace })
    cy.task('stubBookingsForPremisesId', { premisesId: premises.id, bookings })
    cy.task('stubLostBedsForPremisesId', { premisesId: premises.id, lostBeds })

    // When I visit the show bedspace page
    const bedspaceShow = BedspaceShowPage.visit(premises, bedspace)

    // Add I click the void bedspace link
    cy.task('stubLostBedReferenceData')
    bedspaceShow.clickVoidBedspaceLink()

    // Then I navigate to the new lost bed page
    Page.verifyOnPage(LostBedNewPage, premises, bedspace)
  })

  it('navigates to the show void bedspace page', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises, a bedspace, and lost beds the database
    const premises = premisesFactory.build()
    const cas3Premises = cas3PremisesFactory.build({ id: premises.id, status: 'online' })
    const bedspace = cas3BedspaceFactory.build({ status: 'online', startDate: '2023-10-18' })
    const bookings = bookingFactory
      .params({
        bed: bedFactory.build({ id: bedspace.id }),
      })
      .buildList(5)
    const lostBeds = lostBedFactory
      .active()
      .params({
        bedId: bedspace.id,
      })
      .buildList(5)

    cy.task('stubSinglePremises', premises)
    cy.task('stubSinglePremisesV2', cas3Premises)
    cy.task('stubBedspaceV2', { premisesId: cas3Premises.id, bedspace })
    cy.task('stubBookingsForPremisesId', { premisesId: premises.id, bookings })
    cy.task('stubLostBedsForPremisesId', { premisesId: premises.id, lostBeds })
    cy.task('stubSingleLostBed', { premisesId: premises.id, lostBed: lostBeds[0] })

    // When I visit the show bedspace page
    const bedspaceShowPage = BedspaceShowPage.visit(premises, bedspace)

    // Add I click the lost bed link
    bedspaceShowPage.clickLostBedLink(lostBeds[0])

    // Then I navigate to the show lost bed page
    Page.verifyOnPage(LostBedShowPage, premises, bedspace, lostBeds[0])
  })

  it('allows me to create a void booking', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises and a bedspace the database
    const premises = premisesFactory.build()
    const cas3Premises = cas3PremisesFactory.build({ id: premises.id, status: 'online' })
    const bedspace = cas3BedspaceFactory.build()

    cy.task('stubSinglePremises', premises)
    cy.task('stubSinglePremisesV2', cas3Premises)
    cy.task('stubBedspaceV2', { premisesId: cas3Premises.id, bedspace })

    // When I visit the void a bedspace page
    cy.task('stubLostBedReferenceData')
    const page = LostBedNewPage.visit(premises, bedspace)

    // I should see the bedspace details
    page.shouldShowBedspaceDetails()

    // And when I fill out the form
    const lostBed = lostBedFactory.build({
      bedId: bedspace.id,
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

      expect(requestBody.bedId).equal(newLostBed.bedId)
      expect(requestBody.reason).equal(newLostBed.reason)
      expect(requestBody.startDate).equal(newLostBed.startDate)
      expect(requestBody.endDate).equal(newLostBed.endDate)
      expect(requestBody.notes).equal(newLostBed.notes)
    })

    // And I should be redirected to the show booking page
    const lostBedShowPage = Page.verifyOnPage(LostBedShowPage, premises, bedspace, lostBed)
    lostBedShowPage.shouldShowBanner('Void created')
  })

  it('shows create errors when the API returns an error', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises and a bedspace the database
    const premises = premisesFactory.build()
    const cas3Premises = cas3PremisesFactory.build({ id: premises.id, status: 'online' })
    const bedspace = cas3BedspaceFactory.build()

    cy.task('stubSinglePremises', premises)
    cy.task('stubSinglePremisesV2', cas3Premises)
    cy.task('stubBedspaceV2', { premisesId: cas3Premises.id, bedspace })

    // When I visit the new lost bed page
    cy.task('stubLostBedReferenceData')
    const page = LostBedNewPage.visit(premises, bedspace)

    // And I miss required fields
    cy.task('stubLostBedErrors', {
      premisesId: premises.id,
      params: ['startDate', 'endDate'],
    })
    page.clickSubmit()

    // Then I should see error messages relating to those fields
    page.shouldShowErrorMessagesForFields(['startDate', 'endDate'])
  })

  it('shows create errors when the API returns a 409 conflict error', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises, a bedspace, and a conflicting booking in the database
    const premises = premisesFactory.build()
    const cas3Premises = cas3PremisesFactory.build({ id: premises.id, status: 'online' })
    const bedspace = cas3BedspaceFactory.build()
    const conflictingBooking = bookingFactory.build()

    cy.task('stubSinglePremises', premises)
    cy.task('stubSinglePremisesV2', cas3Premises)
    cy.task('stubBedspaceV2', { premisesId: cas3Premises.id, bedspace })
    cy.task('stubBooking', { premisesId: premises.id, booking: conflictingBooking })

    // When I visit the new lost bed page
    cy.task('stubLostBedReferenceData')
    const page = LostBedNewPage.visit(premises, bedspace)

    // And I fill out the form with dates that conflict with an existing lost bed
    const lostBed = lostBedFactory.build({
      bedId: bedspace.id,
    })
    const newLostBed = newLostBedFactory.build({
      ...lostBed,
      reason: lostBed.reason.id,
    })

    cy.task('stubLostBedCreateConflictError', {
      premisesId: premises.id,
      conflictingEntityId: conflictingBooking.id,
      conflictingEntityType: 'booking',
    })

    page.completeForm(newLostBed)

    // Then I should see error messages for conflict
    page.shouldShowDateConflictErrorMessages(conflictingBooking, 'booking')
  })

  it('navigates back from the new lost bed page to the show bedspace page', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises and a bedspace the database
    const premises = premisesFactory.build()
    const cas3Premises = cas3PremisesFactory.build({ id: premises.id, status: 'online' })
    const bedspace = cas3BedspaceFactory.build()
    const bookings = bookingFactory
      .params({
        bed: bedFactory.build({ id: bedspace.id }),
      })
      .buildList(5)
    const lostBeds = lostBedFactory
      .active()
      .params({
        bedId: bedspace.id,
      })
      .buildList(5)

    cy.task('stubSinglePremises', premises)
    cy.task('stubSinglePremisesV2', cas3Premises)
    cy.task('stubBedspaceV2', { premisesId: cas3Premises.id, bedspace })
    cy.task('stubBookingsForPremisesId', { premisesId: premises.id, bookings })
    cy.task('stubLostBedsForPremisesId', { premisesId: premises.id, lostBeds })

    // When I visit the new lost bed page
    cy.task('stubLostBedReferenceData')
    const page = LostBedNewPage.visit(premises, bedspace)

    // And I click the previous bread crumb
    page.clickBreadCrumbUp()

    // Then I navigate to the show bedspace page
    Page.verifyOnPage(BedspaceShowPage, bedspace)
  })

  it('shows a single active lost bed', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises, a bedspace, and an active lost bed in the database
    const premises = premisesFactory.build()
    const cas3Premises = cas3PremisesFactory.build({ id: premises.id, status: 'online' })
    const bedspace = cas3BedspaceFactory.build()
    const lostBed = lostBedFactory.active().build()

    cy.task('stubSinglePremises', premises)
    cy.task('stubSinglePremisesV2', cas3Premises)
    cy.task('stubBedspaceV2', { premisesId: cas3Premises.id, bedspace })
    cy.task('stubSingleLostBed', { premisesId: premises.id, lostBed })

    // When I visit the show lost bed page
    const page = LostBedShowPage.visit(premises, bedspace, lostBed)

    // Then I should see the booking details
    page.shouldShowLostBedDetails()
  })

  it('shows a single cancelled lost bed', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises, a bedspace, and a cancelled lost bed in the database
    const premises = premisesFactory.build()
    const cas3Premises = cas3PremisesFactory.build({ id: premises.id, status: 'online' })
    const bedspace = cas3BedspaceFactory.build()
    const lostBed = lostBedFactory.build({ status: 'cancelled' })

    cy.task('stubSinglePremises', premises)
    cy.task('stubSinglePremisesV2', cas3Premises)
    cy.task('stubBedspaceV2', { premisesId: cas3Premises.id, bedspace })
    cy.task('stubSingleLostBed', { premisesId: premises.id, lostBed })

    // When I visit the show lost bed page
    const page = LostBedShowPage.visit(premises, bedspace, lostBed)

    // Then I should see the booking details
    page.shouldShowLostBedDetails()
  })

  it('navigates back from the show lost bed page to the show bedspace page', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises, a bedspace, and lost beds in the database
    const premises = premisesFactory.build()
    const cas3Premises = cas3PremisesFactory.build({ id: premises.id, status: 'online' })
    const bedspace = cas3BedspaceFactory.build()
    const lostBeds = lostBedFactory
      .params({
        bedId: bedspace.id,
      })
      .buildList(5)

    cy.task('stubSinglePremises', premises)
    cy.task('stubSinglePremisesV2', cas3Premises)
    cy.task('stubBedspaceV2', { premisesId: cas3Premises.id, bedspace })
    cy.task('stubLostBedsForPremisesId', { premisesId: premises.id, lostBeds })
    cy.task('stubSingleLostBed', { premisesId: premises.id, lostBed: lostBeds[0] })

    // When I visit the show lost bed page
    const page = LostBedShowPage.visit(premises, bedspace, lostBeds[0])

    // And I click the previous bread crumb
    page.clickBreadCrumbUp()

    // Then I navigate to the show bedspace page
    Page.verifyOnPage(BedspaceShowPage, bedspace)
  })

  it('navigates to the update void bedspace page', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises, a bedspace and an active lost bed the database
    const premises = premisesFactory.build()
    const cas3Premises = cas3PremisesFactory.build({ id: premises.id, status: 'online' })
    const bedspace = cas3BedspaceFactory.build()
    const lostBed = lostBedFactory.active().build()

    cy.task('stubSinglePremises', premises)
    cy.task('stubSinglePremisesV2', cas3Premises)
    cy.task('stubBedspaceV2', { premisesId: cas3Premises.id, bedspace })
    cy.task('stubSingleLostBed', { premisesId: premises.id, lostBed })

    // When I visit the show lost bed page
    const page = LostBedShowPage.visit(premises, bedspace, lostBed)

    // Add I click the 'Edit this void' link
    cy.task('stubLostBedReferenceData')
    page.clickEditVoidLink()

    // Then I navigate to the edit void booking page
    Page.verifyOnPage(LostBedEditPage, premises, bedspace)
  })

  it('navigates back from the update void booking page to the view void booking page', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises, a bedspace and an active lost bed the database
    const premises = premisesFactory.build()
    const cas3Premises = cas3PremisesFactory.build({ id: premises.id, status: 'online' })
    const bedspace = cas3BedspaceFactory.build()
    const lostBed = lostBedFactory.active().build()
    const bookings = bookingFactory
      .params({
        bed: bedFactory.build({ id: bedspace.id }),
      })
      .buildList(5)
    const lostBeds = lostBedFactory
      .active()
      .params({
        bedId: bedspace.id,
      })
      .buildList(5)

    cy.task('stubSinglePremises', premises)
    cy.task('stubSinglePremisesV2', cas3Premises)
    cy.task('stubBedspaceV2', { premisesId: cas3Premises.id, bedspace })
    cy.task('stubSingleLostBed', { premisesId: premises.id, lostBed })
    cy.task('stubBookingsForPremisesId', { premisesId: premises.id, bookings })
    cy.task('stubLostBedsForPremisesId', { premisesId: premises.id, lostBeds })

    // When I visit the edit void booking page
    cy.task('stubLostBedReferenceData')
    const page = LostBedEditPage.visit(premises, bedspace, lostBed)

    // And I click the previous bread crumb
    page.clickBreadCrumbUp()

    // Then I navigate to the view bedspace page
    Page.verifyOnPage(BedspaceShowPage, bedspace)
  })

  it('allows me to update a void booking', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises, a bedspace and an active lost bed the database
    const premises = premisesFactory.build()
    const cas3Premises = cas3PremisesFactory.build({ id: premises.id, status: 'online' })
    const bedspace = cas3BedspaceFactory.build()
    const lostBed = lostBedFactory.active().build()

    cy.task('stubSinglePremises', premises)
    cy.task('stubSinglePremisesV2', cas3Premises)
    cy.task('stubBedspaceV2', { premisesId: cas3Premises.id, bedspace })
    cy.task('stubSingleLostBed', { premisesId: premises.id, lostBed })

    // When I visit the edit void booking page
    cy.task('stubLostBedReferenceData')
    const page = LostBedEditPage.visit(premises, bedspace, lostBed)

    // I should see the bedspace details
    page.shouldShowBedspaceDetails()

    // And when I fill out the form
    cy.task('stubLostBedUpdate', { premisesId: premises.id, lostBed })
    const updateLostBed = updateLostBedFactory.build()
    page.clearForm()
    page.completeForm(updateLostBed)

    // Then the lost bed should have been updated in the API
    cy.task('verifyLostBedUpdate', { premisesId: premises.id, lostBedId: lostBed.id }).then(requests => {
      expect(requests).to.have.length(1)
      const requestBody = JSON.parse(requests[0].body)

      expect(requestBody.reason).equal(updateLostBed.reason)
      expect(requestBody.startDate).equal(updateLostBed.startDate)
      expect(requestBody.endDate).equal(updateLostBed.endDate)
      expect(requestBody.notes).equal(updateLostBed.notes)
    })
  })

  it('shows update errors when the API returns an error', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises, a bedspace and an active lost bed the database
    const premises = premisesFactory.build()
    const cas3Premises = cas3PremisesFactory.build({ id: premises.id, status: 'online' })
    const bedspace = cas3BedspaceFactory.build()
    const lostBed = lostBedFactory.active().build()

    cy.task('stubSinglePremises', premises)
    cy.task('stubSinglePremisesV2', cas3Premises)
    cy.task('stubBedspaceV2', { premisesId: cas3Premises.id, bedspace })
    cy.task('stubSingleLostBed', { premisesId: premises.id, lostBed })

    // When I visit the edit void booking page
    cy.task('stubLostBedReferenceData')
    const page = LostBedEditPage.visit(premises, bedspace, lostBed)

    // And I miss required fields
    page.clearForm()
    cy.task('stubLostBedUpdateErrors', {
      premisesId: premises.id,
      lostBedId: lostBed.id,
      params: ['startDate', 'endDate'],
    })
    page.clickSubmit()

    // Then I should see error messages relating to those fields
    page.shouldShowErrorMessagesForFields(['startDate', 'endDate'])
  })

  it('navigates to the cancel void booking page', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises, a bedspace and an active lost bed the database
    const premises = premisesFactory.build()
    const cas3Premises = cas3PremisesFactory.build({ id: premises.id, status: 'online' })
    const bedspace = cas3BedspaceFactory.build()
    const lostBed = lostBedFactory.active().build()

    cy.task('stubSinglePremises', premises)
    cy.task('stubSinglePremisesV2', cas3Premises)
    cy.task('stubBedspaceV2', { premisesId: cas3Premises.id, bedspace })
    cy.task('stubSingleLostBed', { premisesId: premises.id, lostBed })

    // When I visit the show lost bed page
    const page = LostBedShowPage.visit(premises, bedspace, lostBed)

    // Add I click the 'Cancel this void' link
    page.clickCancelVoidLink()

    // Then I navigate to the edit void booking page
    Page.verifyOnPage(LostBedCancelPage, premises, bedspace, lostBed)
  })

  it('navigates back from the cancel void booking page to the view void booking page', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises, a bedspace and an active lost bed the database
    const premises = premisesFactory.build()
    const cas3Premises = cas3PremisesFactory.build({ id: premises.id, status: 'online' })
    const bedspace = cas3BedspaceFactory.build()
    const lostBed = lostBedFactory.active().build()
    const bookings = bookingFactory
      .params({
        bed: bedFactory.build({ id: bedspace.id }),
      })
      .buildList(5)
    const lostBeds = [lostBed]

    cy.task('stubSinglePremises', premises)
    cy.task('stubSinglePremisesV2', cas3Premises)
    cy.task('stubBedspaceV2', { premisesId: cas3Premises.id, bedspace })
    cy.task('stubSingleLostBed', { premisesId: premises.id, lostBed })
    cy.task('stubBookingsForPremisesId', { premisesId: premises.id, bookings })
    cy.task('stubLostBedsForPremisesId', { premisesId: premises.id, lostBeds })

    // When I visit the cancel void booking page
    const page = LostBedCancelPage.visit(premises, bedspace, lostBed)

    // And I click the previous bread crumb
    page.clickBreadCrumbUp()

    // Then I navigate to the view bedspace page
    Page.verifyOnPage(BedspaceShowPage, bedspace)
  })

  it('allows me to cancel a void booking', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises, a bedspace and an active lost bed the database
    const premises = premisesFactory.build()
    const cas3Premises = cas3PremisesFactory.build({ id: premises.id, status: 'online' })
    const bedspace = cas3BedspaceFactory.build()
    const lostBed = lostBedFactory.active().build()

    cy.task('stubSinglePremises', premises)
    cy.task('stubSinglePremisesV2', cas3Premises)
    cy.task('stubBedspaceV2', { premisesId: cas3Premises.id, bedspace })
    cy.task('stubSingleLostBed', { premisesId: premises.id, lostBed })

    // When I visit the cancel void booking page
    const page = LostBedCancelPage.visit(premises, bedspace, lostBed)

    // I should see the bedspace details
    page.shouldShowBedspaceDetails()

    // And when I fill out the form
    cy.task('stubLostBedCancel', { premisesId: premises.id, lostBed })
    const cancelLostBed = newLostBedCancellationFactory.build()
    page.completeForm(cancelLostBed)

    // Then the lost bed should have been cancelled in the API
    cy.task('verifyLostBedCancel', { premisesId: premises.id, lostBedId: lostBed.id }).then(requests => {
      expect(requests).to.have.length(1)
      const requestBody = JSON.parse(requests[0].body)

      expect(requestBody.notes).equal(cancelLostBed.notes)
    })
  })
})
