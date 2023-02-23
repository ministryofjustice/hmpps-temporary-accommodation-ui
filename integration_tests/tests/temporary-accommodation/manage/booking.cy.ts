import Page from '../../../../cypress_shared/pages/page'
import BedspaceShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bedspaceShow'
import BookingConfirmPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingConfirm'
import BookingNewPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingNew'
import BookingShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingShow'
import setupTestUser from '../../../../cypress_shared/utils/setupTestUser'
import bookingFactory from '../../../../server/testutils/factories/booking'
import newBookingFactory from '../../../../server/testutils/factories/newBooking'
import premisesFactory from '../../../../server/testutils/factories/premises'
import roomFactory from '../../../../server/testutils/factories/room'

context('Booking', () => {
  beforeEach(() => {
    cy.task('reset')
    setupTestUser()
  })

  it('navigates to the create booking page', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises and a room the database
    const premises = premisesFactory.build()
    const room = roomFactory.build()

    cy.task('stubSinglePremises', premises)
    cy.task('stubSingleRoom', { premisesId: premises.id, room })

    // When I visit the show bedspace page
    const bedspaceShow = BedspaceShowPage.visit(premises, room)

    // Add I click the book bedspace link
    bedspaceShow.clickBookBedspaceLink()

    // Then I navigate to the new booking page
    Page.verifyOnPage(BookingNewPage)
  })

  it('navigates to the show booking page', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises, a room, and bookings in the database
    const premises = premisesFactory.build()
    const room = roomFactory.build()
    const bookings = bookingFactory
      .params({
        bed: room.beds[0],
      })
      .buildList(5)

    cy.task('stubSinglePremises', premises)
    cy.task('stubSingleRoom', { premisesId: premises.id, room })
    cy.task('stubBookingsForPremisesId', { premisesId: premises.id, bookings })
    cy.task('stubBooking', { premisesId: premises.id, booking: bookings[0] })

    // When I visit the show bedspace page
    const bedspaceShowPage = BedspaceShowPage.visit(premises, room)

    // Add I click the booking link
    bedspaceShowPage.clickBookingLink(bookings[0])

    // Then I navigate to the booking page
    Page.verifyOnPage(BookingShowPage, premises, room, bookings[0])
  })

  it('allows me to create a booking', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises and a room the database
    const premises = premisesFactory.build()
    const room = roomFactory.build()

    cy.task('stubSinglePremises', premises)
    cy.task('stubSingleRoom', { premisesId: premises.id, room })

    // When I visit the new booking page
    const bookingNewPage = BookingNewPage.visit(premises.id, room.id)

    // And I fill out the form
    const booking = bookingFactory.build()
    const newBooking = newBookingFactory.build({
      ...booking,
      crn: booking.person.crn,
    })

    bookingNewPage.completeForm(newBooking)

    // And I confirm the booking
    const bookingConfirmPage = Page.verifyOnPage(BookingConfirmPage, premises, room, booking)
    bookingConfirmPage.shouldShowBookingDetails()

    cy.task('stubBookingCreate', { premisesId: premises.id, booking })
    cy.task('stubBooking', { premisesId: premises.id, booking })

    bookingConfirmPage.clickSubmit()

    // Then a booking should have been created in the API
    cy.task('verifyBookingCreate', premises.id).then(requests => {
      expect(requests).to.have.length(1)
      const requestBody = JSON.parse(requests[0].body)

      expect(requestBody.service).equal('temporary-accommodation')
      expect(requestBody.bedId).equal(room.beds[0].id)
      expect(requestBody.crn).equal(newBooking.crn)
      expect(requestBody.arrivalDate).equal(newBooking.arrivalDate)
      expect(requestBody.departureDate).equal(newBooking.departureDate)
    })

    // And I should be redirected to the show booking page
    const bookingShowPage = Page.verifyOnPage(BookingShowPage, premises, room, booking)
    bookingShowPage.shouldShowBanner('Booking created')
  })

  it('shows a suggested end date for the booking', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises and a room the database
    const premises = premisesFactory.build()
    const room = roomFactory.build()

    cy.task('stubSinglePremises', premises)
    cy.task('stubSingleRoom', { premisesId: premises.id, room })

    // When I visit the new booking page
    const page = BookingNewPage.visit(premises.id, room.id)

    // And I enter a start date
    page.completeDateInputs('arrivalDate', '2022-07-08')

    // Then I should see a suggested end date
    page.shouldShowEndDateHint('30/9/2022')
  })

  it('shows errors when the API returns an error', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises and a room the database
    const premises = premisesFactory.build()
    const room = roomFactory.build()

    cy.task('stubSinglePremises', premises)
    cy.task('stubSingleRoom', { premisesId: premises.id, room })

    // When I visit the new booking page
    const bookingNewPage = BookingNewPage.visit(premises.id, room.id)

    // And I miss required fields
    bookingNewPage.clickSubmit()

    // And I confirm the booking
    const bookingConfirmPage = Page.verifyOnPage(BookingConfirmPage, premises, room)

    cy.task('stubBookingCreateErrors', {
      premisesId: premises.id,
      params: ['crn', 'arrivalDate', 'departureDate'],
    })
    bookingConfirmPage.clickSubmit()

    // Then I should see error messages relating to those fields
    const returnedBookingNewPage = Page.verifyOnPage(BookingNewPage)
    returnedBookingNewPage.shouldShowErrorMessagesForFields(['crn', 'arrivalDate', 'departureDate'])
  })

  it('shows errors when the API returns a 409 conflict error', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises and a room the database
    const premises = premisesFactory.build()
    const room = roomFactory.build()

    cy.task('stubSinglePremises', premises)
    cy.task('stubSingleRoom', { premisesId: premises.id, room })

    // When I visit the new booking page
    const bookingNewPage = BookingNewPage.visit(premises.id, room.id)

    // And I fill out the form with dates that conflict with an existing booking
    const booking = bookingFactory.build()
    const newBooking = newBookingFactory.build({
      ...booking,
      crn: booking.person.crn,
    })

    bookingNewPage.completeForm(newBooking)

    // And I confirm the booking
    const bookingConfirmPage = Page.verifyOnPage(BookingConfirmPage, premises, room, booking)

    cy.task('stubBookingCreateConflictError', premises.id)
    bookingConfirmPage.clickSubmit()

    // Then I should see error messages for the date fields
    const returnedBookingNewPage = Page.verifyOnPage(BookingNewPage)

    returnedBookingNewPage.shouldShowPrefilledBookingDetails(newBooking)
    returnedBookingNewPage.shouldShowDateConflictErrorMessages()
  })

  it('navigates back from the new booking page to the show bedspace page', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises and a room the database
    const premises = premisesFactory.build()
    const room = roomFactory.build()

    cy.task('stubSinglePremises', premises)
    cy.task('stubSingleRoom', { premisesId: premises.id, room })

    // When I visit the new booking page
    const page = BookingNewPage.visit(premises.id, room.id)

    // And I click the previous bread crumb
    page.clickBreadCrumbUp()

    // Then I navigate to the show bedspace page
    Page.verifyOnPage(BedspaceShowPage, premises, room)
  })

  it('navigates back from the confirm booking page to the new booking page', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises and a room the database
    const premises = premisesFactory.build()
    const room = roomFactory.build()

    cy.task('stubSinglePremises', premises)
    cy.task('stubSingleRoom', { premisesId: premises.id, room })

    // When I visit the new booking page
    const bookingNewPage = BookingNewPage.visit(premises.id, room.id)

    // And I fill out the form
    const booking = bookingFactory.build()
    const newBooking = newBookingFactory.build({
      ...booking,
      crn: booking.person.crn,
    })

    bookingNewPage.completeForm(newBooking)

    // And I click the back link
    const bookingConfirmPage = Page.verifyOnPage(BookingConfirmPage, premises, room, booking)
    bookingConfirmPage.clickBack()

    // Then I navigate to the new booking page
    const returnedBookingNewPage = Page.verifyOnPage(BookingNewPage)
    returnedBookingNewPage.shouldShowPrefilledBookingDetails(newBooking)
  })

  it('shows a single booking', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises, a room, and a booking in the database
    const premises = premisesFactory.build()
    const room = roomFactory.build()
    const booking = bookingFactory.build()

    cy.task('stubSinglePremises', premises)
    cy.task('stubSingleRoom', { premisesId: premises.id, room })
    cy.task('stubBooking', { premisesId: premises.id, booking })

    // When I visit the show booking page
    const page = BookingShowPage.visit(premises, room, booking)

    // Then I should see the booking details
    page.shouldShowBookingDetails()
  })

  it('navigates back from the show booking page to the show bedspace page', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises, a room, and bookings in the database
    const premises = premisesFactory.build()
    const room = roomFactory.build()
    const bookings = bookingFactory
      .params({
        bed: room.beds[0],
      })
      .buildList(5)

    cy.task('stubSinglePremises', premises)
    cy.task('stubSingleRoom', { premisesId: premises.id, room })
    cy.task('stubBookingsForPremisesId', { premisesId: premises.id, bookings })
    cy.task('stubBooking', { premisesId: premises.id, booking: bookings[0] })

    // When I visit the show booking page
    const page = BookingShowPage.visit(premises, room, bookings[0])

    // And I click the previous bread crumb
    page.clickBreadCrumbUp()

    // Then I navigate to the show bedspace page
    Page.verifyOnPage(BedspaceShowPage, premises, room)
  })
})
