import Page from '../../../../cypress_shared/pages/page'
import BookingDepartureNewPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingDepartureNew'
import BookingShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingShow'
import setupTestUser from '../../../../cypress_shared/utils/setupTestUser'
import bookingFactory from '../../../../server/testutils/factories/booking'
import departureFactory from '../../../../server/testutils/factories/departure'
import newDepartureFactory from '../../../../server/testutils/factories/newDeparture'
import premisesFactory from '../../../../server/testutils/factories/premises'
import roomFactory from '../../../../server/testutils/factories/room'

context('Booking departure', () => {
  beforeEach(() => {
    cy.task('reset')
    setupTestUser()
  })

  it('navigates to the booking departure page', () => {
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

    // Add I click the marked departed booking action
    cy.task('stubDepartureReferenceData')
    bookingShow.clickMarkDepartedBookingButton()

    // Then I navigate to the booking departure page
    Page.verifyOnPage(BookingDepartureNewPage, premises.id, room.id, booking)
  })

  it('allows me to mark a booking as departed', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises, a room, and an arrived booking in the database
    const premises = premisesFactory.build()
    const room = roomFactory.build()
    const booking = bookingFactory.arrived().build()

    cy.task('stubSinglePremises', premises)
    cy.task('stubSingleRoom', { premisesId: premises.id, room })
    cy.task('stubBooking', { premisesId: premises.id, booking })

    // When I visit the booking departure page
    cy.task('stubDepartureReferenceData')
    const page = BookingDepartureNewPage.visit(premises.id, room.id, booking)
    page.shouldShowBookingDetails()

    // And I fill out the form
    const departure = departureFactory.build()
    const newDeparture = newDepartureFactory.build({
      ...departure,
      reasonId: departure.reason.id,
      moveOnCategoryId: departure.moveOnCategory.id,
    })

    cy.task('stubDepartureCreate', { premisesId: premises.id, bookingId: booking.id, departure })

    page.completeForm(newDeparture)

    // Then the departure should have been created in the API
    cy.task('verifyDepartureCreate', { premisesId: premises.id, bookingId: booking.id }).then(requests => {
      expect(requests).to.have.length(1)
      const requestBody = JSON.parse(requests[0].body)
      expect(requestBody.dateTime).equal(newDeparture.dateTime)
      expect(requestBody.reasonId).equal(newDeparture.reasonId)
      expect(requestBody.moveOnCategoryId).equal(newDeparture.moveOnCategoryId)
      expect(requestBody.notes).equal(newDeparture.notes)
    })

    // And I should be redirected to the show booking page
    const bookingShowPage = Page.verifyOnPage(BookingShowPage, premises, room, booking)
    bookingShowPage.shouldShowBanner('Booking marked as closed')
  })

  it('shows errors when the API returns an error', () => {
    // Given I am signed in
    cy.signIn()

    // And there is an arrived booking in the database
    const premises = premisesFactory.build()
    const room = roomFactory.build()
    const booking = bookingFactory.arrived().build()

    cy.task('stubBooking', { premisesId: premises.id, booking })

    // When I visit the booking departure page
    cy.task('stubDepartureReferenceData')
    const page = BookingDepartureNewPage.visit(premises.id, room.id, booking)

    // And I miss required fields
    cy.task('stubDepartureCreateErrors', {
      premisesId: premises.id,
      bookingId: booking.id,
      params: ['dateTime', 'reasonId', 'moveOnCategoryId'],
    })
    page.clearForm()
    page.clickSubmit()

    // Then I should see error messages relating to those fields
    page.shouldShowErrorMessagesForFields(['dateTime', 'reasonId', 'moveOnCategoryId'])
  })

  it('navigates back from the booking departure page to the show booking page', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises, a room, and an arrived booking in the database
    const premises = premisesFactory.build()
    const room = roomFactory.build()
    const booking = bookingFactory.arrived().build()

    cy.task('stubSinglePremises', premises)
    cy.task('stubSingleRoom', { premisesId: premises.id, room })
    cy.task('stubBooking', { premisesId: premises.id, booking })

    // When I visit the booking departure page
    cy.task('stubDepartureReferenceData')
    const page = BookingDepartureNewPage.visit(premises.id, room.id, booking)

    // And I click the back link
    page.clickBack()

    // Then I navigate to the show bedspace page
    Page.verifyOnPage(BookingShowPage, booking)
  })
})
