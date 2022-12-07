import premisesFactory from '../../../../server/testutils/factories/premises'
import roomFactory from '../../../../server/testutils/factories/room'
import bookingFactory from '../../../../server/testutils/factories/booking'
import Page from '../../../../cypress_shared/pages/page'
import BookingShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingShow'
import extensionFactory from '../../../../server/testutils/factories/extension'
import newExtensionFactory from '../../../../server/testutils/factories/newExtension'
import BookingExtensionNewPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingExtensionNew'

context('Booking extension', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
  })

  it('navigates to the booking extension page', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises, a room, and an arrived booking in the database
    const premises = premisesFactory.build()
    const room = roomFactory.build()
    const booking = bookingFactory.arrived().build()

    cy.task('stubSinglePremises', premises)
    cy.task('stubSingleRoom', { premisesId: premises.id, room })
    cy.task('stubBooking', { premisesId: premises.id, booking })

    // When I visit the show booking page
    const bookingShow = BookingShowPage.visit(premises, room, booking)

    // Add I click the extend booking action
    bookingShow.clickExtendBookingButton()

    // Then I navigate to the booking extension page
    Page.verifyOnPage(BookingExtensionNewPage, premises.id, room.id, booking)
  })

  it('allows me to extend a booking', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises, a room, and an arrived booking in the database
    const premises = premisesFactory.build()
    const room = roomFactory.build()
    const booking = bookingFactory.arrived().build()

    cy.task('stubSinglePremises', premises)
    cy.task('stubSingleRoom', { premisesId: premises.id, room })
    cy.task('stubBooking', { premisesId: premises.id, booking })

    // When I visit the booking extension page
    const page = BookingExtensionNewPage.visit(premises.id, room.id, booking)
    page.shouldShowBookingDetails()

    // And I fill out the form
    const extension = extensionFactory.build()
    const newExtension = newExtensionFactory.build({
      ...extension,
    })

    cy.task('stubExtensionCreate', { premisesId: premises.id, bookingId: booking.id, extension })

    page.completeForm(newExtension)

    // Then the extension should have been created in the API
    cy.task('verifyExtensionCreate', { premisesId: premises.id, bookingId: booking.id }).then(requests => {
      expect(requests).to.have.length(1)
      const requestBody = JSON.parse(requests[0].body)
      expect(requestBody.newDepartureDate).equal(newExtension.newDepartureDate)
      expect(requestBody.notes).equal(newExtension.notes)
    })

    // And I should be redirected to the show booking page
    const bookingShowPage = Page.verifyOnPage(BookingShowPage, premises, room, booking)
    bookingShowPage.shouldShowBanner('Booking departure date changed')
  })

  it('shows errors when the API returns an error', () => {
    // Given I am signed in
    cy.signIn()

    // And there is an arrived booking in the database
    const premises = premisesFactory.build()
    const room = roomFactory.build()
    const booking = bookingFactory.arrived().build()

    cy.task('stubBooking', { premisesId: premises.id, booking })

    // When I visit the booking extension page
    const page = BookingExtensionNewPage.visit(premises.id, room.id, booking)

    // And I miss required fields
    cy.task('stubExtensionCreateErrors', {
      premisesId: premises.id,
      bookingId: booking.id,
      params: ['newDepartureDate'],
    })
    page.clearForm()
    page.clickSubmit()

    // Then I should see error messages relating to those fields
    page.shouldShowErrorMessagesForFields(['newDepartureDate'])
  })

  it('shows errors when the API returns a 409 conflict error', () => {
    // Given I am signed in
    cy.signIn()

    // And there is an arrived booking in the database
    const premises = premisesFactory.build()
    const room = roomFactory.build()
    const booking = bookingFactory.arrived().build()

    cy.task('stubBooking', { premisesId: premises.id, booking })

    // When I visit the booking extension page
    const page = BookingExtensionNewPage.visit(premises.id, room.id, booking)

    // And I fill out the form with dates that conflict with an existing booking
    const extension = extensionFactory.build()
    const newExtension = newExtensionFactory.build({
      ...extension,
    })
    cy.task('stubExtensionCreateConflictError', { premisesId: premises.id, bookingId: booking.id })

    page.completeForm(newExtension)

    // Then I should see error messages for the date fields
    page.shouldShowDateConflictErrorMessages()
  })

  it('navigates back from the booking extension page to the show booking page', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises, a room, and an arrived booking in the database
    const premises = premisesFactory.build()
    const room = roomFactory.build()
    const booking = bookingFactory.arrived().build()

    cy.task('stubSinglePremises', premises)
    cy.task('stubSingleRoom', { premisesId: premises.id, room })
    cy.task('stubBooking', { premisesId: premises.id, booking })

    // When I visit the booking extension page
    const page = BookingExtensionNewPage.visit(premises.id, room.id, booking)

    // And I click the back link
    page.clickBack()

    // Then I navigate to the show bedspace page
    Page.verifyOnPage(BookingShowPage, booking)
  })
})
