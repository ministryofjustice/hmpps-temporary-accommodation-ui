import premisesFactory from '../../server/testutils/factories/premises'
import bookingsFactory from '../../server/testutils/factories/booking'
import PremisesListPage from '../pages/premisesList'
import PremisesShowPage from '../pages/premisesShow'

context('Premises', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
  })

  it('should list all premises', () => {
    // Given I am signed in
    cy.signIn()

    // And there are premises in the database
    const premises = premisesFactory.buildList(5)
    cy.task('stubPremises', premises)

    // When I visit the premises page
    const page = PremisesListPage.visit()

    // Then I should see all of the premises listed
    page.shouldShowPremises(premises)
  })

  it('should show a single premises', () => {
    // Given there is a premises in the database
    const premises = premisesFactory.build()
    const bookingsArrivingToday = bookingsFactory.arrivingToday().buildList(2)
    const bookingsLeavingToday = bookingsFactory.departingToday().buildList(2)
    const bookingsArrivingSoon = bookingsFactory.arrivingSoon().buildList(5)
    const bookingsDepartingSoon = bookingsFactory.departingSoon().buildList(5)
    const bookings = [
      ...bookingsArrivingToday,
      ...bookingsLeavingToday,
      ...bookingsArrivingSoon,
      ...bookingsDepartingSoon,
    ]

    cy.task('stubPremisesWithBookings', { premises, bookings })

    // And I am signed in
    cy.signIn()

    // When I visit the premises page
    const page = PremisesShowPage.visit(premises)

    // Then I should see the premises details shown
    page.shouldShowPremisesDetail()

    // And I should see all the bookings for that premises listed
    page.shouldShowBookings(bookingsArrivingToday, bookingsLeavingToday, bookingsArrivingSoon, bookingsDepartingSoon)

    // And I should see all the current residents for that premises listed
    page.shouldShowCurrentResidents(bookingsDepartingSoon)
  })
})
