import premisesFactory from '../../../../server/testutils/factories/premises'
import roomFactory from '../../../../server/testutils/factories/room'
import bookingFactory from '../../../../server/testutils/factories/booking'
import Page from '../../../../cypress_shared/pages/page'
import BookingShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingShow'
import BookingHistoryPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingHistory'
import { deriveBookingHistory } from '../../../../server/utils/bookingUtils'
import stubActingUser from '../../../../cypress_shared/utils/stubActingUser'

context('Booking history', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    stubActingUser()
  })

  it('navigates to the booking history page', () => {
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
    const bookingShowPage = BookingShowPage.visit(premises, room, booking)

    // Add I click the history link
    bookingShowPage.clickHistoryLink()

    // Then I navigate to the booking page
    Page.verifyOnPage(
      BookingHistoryPage,
      premises,
      room,
      booking,
      deriveBookingHistory(booking).map(({ booking: historicBooking }) => historicBooking),
    )
  })

  it('shows booking history page', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises, a room, and a booking in the database
    const premises = premisesFactory.build()
    const room = roomFactory.build()
    const booking = bookingFactory.build()

    cy.task('stubSinglePremises', premises)
    cy.task('stubSingleRoom', { premisesId: premises.id, room })
    cy.task('stubBooking', { premisesId: premises.id, booking })

    // When I visit the booking history page
    const bookingHistoryPage = BookingHistoryPage.visit(
      premises,
      room,
      booking,
      deriveBookingHistory(booking).map(({ booking: historicBooking }) => historicBooking),
    )

    // It shows booking history
    bookingHistoryPage.shouldShowBookingHistory()
  })

  it('navigates back from the booking history page to the show booking page', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises, a room, and a booking in the database
    const premises = premisesFactory.build()
    const room = roomFactory.build()
    const booking = bookingFactory.build()

    cy.task('stubSinglePremises', premises)
    cy.task('stubSingleRoom', { premisesId: premises.id, room })
    cy.task('stubBooking', { premisesId: premises.id, booking })

    // When I visit the booking history page
    const bookingHistoryPage = BookingHistoryPage.visit(
      premises,
      room,
      booking,
      deriveBookingHistory(booking).map(({ booking: historicBooking }) => historicBooking),
    )

    // And I click the back link
    bookingHistoryPage.clickBack()

    // Then I navigate to the show bedspace page
    Page.verifyOnPage(BookingShowPage, premises, room, booking)
  })
})
