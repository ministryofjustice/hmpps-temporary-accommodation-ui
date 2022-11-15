import BookingNewPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingNew'
import premisesFactory from '../../../../server/testutils/factories/premises'
import roomFactory from '../../../../server/testutils/factories/room'
import bookingFactory from '../../../../server/testutils/factories/booking'
import bedFactory from '../../../../server/testutils/factories/bed'
import newBookingFactory from '../../../../server/testutils/factories/newBooking'
import Page from '../../../../cypress_shared/pages/page'
import BedspaceShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bedspaceShow'
import BookingShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingShow'

context('Booking', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
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
    const bedspaceShow = BedspaceShowPage.visit(premises.id, room)

    // Add I click the book bedspace link
    bedspaceShow.clickBookBedspaceLink()

    // Then I navigate to the new booking page
    Page.verifyOnPage(BookingNewPage)
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
    const page = BookingNewPage.visit(premises.id, room.id)

    // And I fill out the form
    const booking = bookingFactory.build({
      bed: bedFactory.build({
        id: room.beds[0].id,
      }),
    })
    const newBooking = newBookingFactory.build({
      ...booking,
    })

    cy.task('stubBookingCreate', { premisesId: premises.id, booking })
    cy.task('stubBooking', { premisesId: premises.id, booking })

    page.completeForm(newBooking)

    // Then a booking should have been created in the API
    cy.task('verifyBookingCreate', { premisesId: premises.id, roomId: room.id }).then(requests => {
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
    const page = BookingNewPage.visit(premises.id, room.id)

    // And I miss required fields
    cy.task('stubBookingCreateErrors', {
      premisesId: premises.id,
      params: ['crn', 'arrivalDate', 'departureDate'],
    })
    page.clickSubmit()

    // Then I should see error messages relating to those fields
    page.shouldShowErrorMessagesForFields(['crn', 'arrivalDate', 'departureDate'])
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
    const page = BookingNewPage.visit(premises.id, room.id)

    // And I fill out the form with dates that conflict with an existing booking
    const booking = bookingFactory.build({
      bed: bedFactory.build({
        id: room.beds[0].id,
      }),
    })
    const newBooking = newBookingFactory.build({
      ...booking,
    })

    cy.task('stubBookingCreateConflictError', premises.id)

    page.completeForm(newBooking)

    // Then I should see error messages for the date fields
    page.shouldShowDateConflictErrorMessages()
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
    Page.verifyOnPage(BedspaceShowPage, premises)
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
        bed: bedFactory.build({
          id: room.beds[0].id,
        }),
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
    Page.verifyOnPage(BedspaceShowPage, room)
  })
})
