import Page from '../../../../cypress_shared/pages/page'
import BookingDepartureEditPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingDepartureEdit'
import BookingDepartureNewPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingDepartureNew'
import BookingShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingShow'
import { setupBookingStateStubs } from '../../../../cypress_shared/utils/booking'
import setupTestUser from '../../../../cypress_shared/utils/setupTestUser'
import bookingFactory from '../../../../server/testutils/factories/booking'
import departureFactory from '../../../../server/testutils/factories/departure'
import newDepartureFactory from '../../../../server/testutils/factories/newDeparture'

context('Booking departure', () => {
  beforeEach(() => {
    cy.task('reset')
    setupTestUser()
  })

  it('navigates to the booking departure page', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises, a room, and an arrived booking in the database
    const booking = bookingFactory.arrived().build()
    const { premises, room } = setupBookingStateStubs(booking)

    // When I visit the show booking page
    const bookingShow = BookingShowPage.visit(premises, room, booking)

    // Add I click the marked departed booking action
    cy.task('stubDepartureReferenceData')
    bookingShow.clickMarkDepartedBookingButton()

    // Then I navigate to the booking departure page
    Page.verifyOnPage(BookingDepartureNewPage, premises, room, booking)
  })

  it('navigates to the edit booking departure page', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises, a room, and a departed booking in the database
    const booking = bookingFactory.departed().build()
    const { premises, room } = setupBookingStateStubs(booking)

    // When I visit the show booking page
    const bookingShow = BookingShowPage.visit(premises, room, booking)

    // Add I click the marked departed booking action
    cy.task('stubDepartureReferenceData')
    bookingShow.clickEditDepartedBookingButton()

    // Then I navigate to the booking departure page
    Page.verifyOnPage(BookingDepartureEditPage, premises, room, booking)
  })

  it('allows me to mark a booking as departed', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises, a room, and an arrived booking in the database
    const booking = bookingFactory.arrived().build()
    const { premises, room } = setupBookingStateStubs(booking)

    // When I visit the booking departure page
    cy.task('stubDepartureReferenceData')
    const page = BookingDepartureNewPage.visit(premises, room, booking)
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

  it('shows errors when the API returns an error when marking a booking as departed', () => {
    // Given I am signed in
    cy.signIn()

    // And there is an arrived booking in the database
    const booking = bookingFactory.arrived().build()
    const { premises, room } = setupBookingStateStubs(booking)

    // When I visit the booking departure page
    cy.task('stubDepartureReferenceData')
    const page = BookingDepartureNewPage.visit(premises, room, booking)

    // And I miss required fields
    cy.task('stubDepartureCreateErrors', {
      premisesId: premises.id,
      bookingId: booking.id,
      params: ['dateTime', 'reasonId', 'moveOnCategoryId'],
    })
    page.clickSubmit()

    // Then I should see error messages relating to those fields
    page.shouldShowErrorMessagesForFields(['dateTime', 'reasonId', 'moveOnCategoryId'])
  })

  it('navigates back from the booking departure page to the show booking page', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises, a room, and an arrived booking in the database
    const booking = bookingFactory.arrived().build()
    const { premises, room } = setupBookingStateStubs(booking)

    // When I visit the booking departure page
    cy.task('stubDepartureReferenceData')
    const page = BookingDepartureNewPage.visit(premises, room, booking)

    // And I click the back link
    page.clickBack()

    // Then I navigate to the show bedspace page
    Page.verifyOnPage(BookingShowPage, premises, room, booking)
  })

  it('allows me to edit a departed booking', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises, a room, and a departed booking in the database
    const booking = bookingFactory.departed().build()
    const { premises, room } = setupBookingStateStubs(booking)

    // When I visit the edit departed booking page
    cy.task('stubDepartureReferenceData')
    const page = BookingDepartureEditPage.visit(premises, room, booking)
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
    bookingShowPage.shouldShowBanner('Closed booking updated')
  })

  it('shows errors when the API returns an error when editing a departed booking', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a departed booking in the database
    const booking = bookingFactory.departed().build()
    const { premises, room } = setupBookingStateStubs(booking)

    // When I visit the edit departed booking page
    cy.task('stubDepartureReferenceData')
    const page = BookingDepartureEditPage.visit(premises, room, booking)

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

  it('navigates back from the edit departured page to the show booking page', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises, a room, and a departed booking in the database
    const booking = bookingFactory.departed().build()
    const { premises, room } = setupBookingStateStubs(booking)

    // When I visit the edit departed booking page
    cy.task('stubDepartureReferenceData')
    const page = BookingDepartureEditPage.visit(premises, room, booking)

    // And I click the back link
    page.clickBack()

    // Then I navigate to the show bedspace page
    Page.verifyOnPage(BookingShowPage, premises, room, booking)
  })
})
