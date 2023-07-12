import Page from '../../../../cypress_shared/pages/page'
import BookingExtensionNewPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingExtensionNew'
import BookingShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingShow'
import { setupBookingStateStubs } from '../../../../cypress_shared/utils/booking'
import { setupTestUser } from '../../../../cypress_shared/utils/setupTestUser'
import {
  bookingFactory,
  extensionFactory,
  lostBedFactory,
  newExtensionFactory,
} from '../../../../server/testutils/factories'

context('Booking extension', () => {
  beforeEach(() => {
    cy.task('reset')
    setupTestUser('assessor')
  })

  it('navigates to the booking extension page', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises, a room, and an arrived booking in the database
    const booking = bookingFactory.arrived().build()
    const { premises, room } = setupBookingStateStubs(booking)

    // When I visit the show booking page
    const bookingShow = BookingShowPage.visit(premises, room, booking)

    // Add I click the extend booking action
    bookingShow.clickExtendBookingButton()

    // Then I navigate to the booking extension page
    Page.verifyOnPage(BookingExtensionNewPage, premises, room, booking)
  })

  it('allows me to extend a booking', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises, a room, and an arrived booking in the database
    const booking = bookingFactory.arrived().build()
    const { premises, room } = setupBookingStateStubs(booking)

    // When I visit the booking extension page
    const page = BookingExtensionNewPage.visit(premises, room, booking)
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
    const booking = bookingFactory.arrived().build()
    const { premises, room } = setupBookingStateStubs(booking)

    // When I visit the booking extension page
    const page = BookingExtensionNewPage.visit(premises, room, booking)

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

    // And there is an arrived booking and a conflicting lost bed in the database
    const booking = bookingFactory.arrived().build()
    const conflictingLostBed = lostBedFactory.build()

    const { premises, room } = setupBookingStateStubs(booking)
    cy.task('stubSingleLostBed', { premisesId: premises.id, lostBed: conflictingLostBed })

    // When I visit the booking extension page
    const page = BookingExtensionNewPage.visit(premises, room, booking)

    // And I fill out the form with dates that conflict with an existing booking
    const extension = extensionFactory.build()
    const newExtension = newExtensionFactory.build({
      ...extension,
    })
    cy.task('stubExtensionCreateConflictError', {
      premisesId: premises.id,
      bookingId: booking.id,
      conflictingEntityId: conflictingLostBed.id,
      conflictingEntityType: 'lost-bed',
    })

    page.completeForm(newExtension)

    // Then I should see error messages for the conflict
    page.shouldShowDateConflictErrorMessages(conflictingLostBed, 'lost-bed')
  })

  it('navigates back from the booking extension page to the show booking page', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises, a room, and an arrived booking in the database
    const booking = bookingFactory.arrived().build()
    const { premises, room } = setupBookingStateStubs(booking)

    // When I visit the booking extension page
    const page = BookingExtensionNewPage.visit(premises, room, booking)

    // And I click the back link
    page.clickBack()

    // Then I navigate to the show bedspace page
    Page.verifyOnPage(BookingShowPage, premises, room, booking)
  })
})
