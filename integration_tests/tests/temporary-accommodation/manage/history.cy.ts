import Page from '../../../../cypress_shared/pages/page'
import BookingHistoryPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingHistory'
import BookingShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingShow'
import { setupBookingStateStubs } from '../../../../cypress_shared/utils/booking'
import { setupTestUser } from '../../../../cypress_shared/utils/setupTestUser'
import { bookingFactory } from '../../../../server/testutils/factories'
import { deriveBookingHistory } from '../../../../server/utils/bookingUtils'

context('Booking history', () => {
  beforeEach(() => {
    cy.task('reset')
    setupTestUser('assessor')
  })

  it('navigates to the booking history page', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises, a room, and a booking in the database
    const booking = bookingFactory.build()
    const { premises, room } = setupBookingStateStubs(booking)

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
    const booking = bookingFactory.build()
    const { premises, room } = setupBookingStateStubs(booking)

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
    const booking = bookingFactory.build()
    const { premises, room } = setupBookingStateStubs(booking)

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
