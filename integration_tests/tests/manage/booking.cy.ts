import premisesFactory from '../../../server/testutils/factories/premises'
import bookingFactory from '../../../server/testutils/factories/booking'
import dateCapacityFactory from '../../../server/testutils/factories/dateCapacity'

import { BookingFindPage, BookingNewPage, BookingShowPage } from '../../../cypress_shared/pages/manage'
import Page from '../../../cypress_shared/pages/page'

import BookingConfirmation from '../../../cypress_shared/pages/manage/booking/confirmation'
import personFactory from '../../../server/testutils/factories/person'

context('Booking', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
  })

  it('should show the CRN form followed by the booking form', () => {
    const person = personFactory.build()
    const booking = bookingFactory.build({
      person,
      arrivalDate: '2022-06-01',
      departureDate: '2022-06-01',
    })
    const firstOvercapacityPeriodStartDate = dateCapacityFactory.build({
      date: new Date(2023, 0, 1).toISOString(),
      availableBeds: -1,
    })
    const firstOvercapacityPeriodEndDate = dateCapacityFactory.build({
      date: new Date(2023, 1, 1).toISOString(),
      availableBeds: -1,
    })
    const atCapacityDate = dateCapacityFactory.build({
      date: new Date(2023, 1, 1).toISOString(),
      availableBeds: 0,
    })
    const secondOvercapacityPeriodStartDate = dateCapacityFactory.build({
      date: new Date(2023, 2, 1).toISOString(),
      availableBeds: -1,
    })
    const secondOvercapacityPeriodEndDate = dateCapacityFactory.build({
      date: new Date(2023, 3, 1).toISOString(),
      availableBeds: -1,
    })
    const premises = premisesFactory.build()

    cy.task('stubBookingCreate', { premisesId: premises.id, booking })
    cy.task('stubBookingGet', { premisesId: premises.id, booking })
    cy.task('stubSinglePremises', { premisesId: premises.id, booking })
    cy.task('stubPremisesCapacity', {
      premisesId: premises.id,
      dateCapacities: [
        firstOvercapacityPeriodStartDate,
        firstOvercapacityPeriodEndDate,
        atCapacityDate,
        secondOvercapacityPeriodStartDate,
        secondOvercapacityPeriodEndDate,
      ],
    })
    cy.task('stubFindPerson', { person })

    // Given I am signed in
    cy.signIn()

    // When I visit the first new booking page
    const bookingNewPage = BookingFindPage.visit(premises.id)

    // And I enter the CRN to the form
    bookingNewPage.enterCrn(person.crn)
    bookingNewPage.clickSubmit()

    // Then I should be redirected to the second new booking page
    Page.verifyOnPage(BookingNewPage)
    const bookingCreatePage = new BookingNewPage()
    bookingCreatePage.verifyPersonIsVisible(person)

    cy.task('verifyFindPerson', { person }).then(requests => {
      expect(requests).to.have.length(2)
    })

    // Given I have entered a CRN and the person has been found
    // When I fill in the booking form
    bookingCreatePage.completeForm(booking)
    bookingCreatePage.clickSubmit()

    // Then I should be redirected to the confirmation page
    Page.verifyOnPage(BookingConfirmation)
    const bookingConfirmationPage = new BookingConfirmation()
    bookingConfirmationPage.verifyBookingIsVisible(booking)
    // And I should see the overcapacity message
    bookingConfirmationPage.shouldShowOvercapacityMessage(
      { start: firstOvercapacityPeriodStartDate.date, end: firstOvercapacityPeriodEndDate.date },
      { start: secondOvercapacityPeriodStartDate.date, end: secondOvercapacityPeriodEndDate.date },
    )

    // And the booking should be created in the API
    cy.task('verifyBookingCreate', { premisesId: premises.id }).then(requests => {
      expect(requests).to.have.length(1)
      const requestBody = JSON.parse(requests[0].body)

      expect(requestBody.arrivalDate).equal(booking.arrivalDate)
      expect(requestBody.departureDate).equal(booking.departureDate)
    })
  })

  it('should show errors for the find page and the new booking page', () => {
    const premises = premisesFactory.build()
    const person = personFactory.build()

    cy.task('stubSinglePremises', premises)

    // Given I am signed in
    cy.signIn()

    // When I visit the find page
    const page = BookingFindPage.visit(premises.id)

    // And I miss a required field
    cy.task('stubPersonNotFound', {
      person,
    })
    page.clickSubmit()

    cy.task('stubFindPerson', { premisesId: premises.id, person })

    // Then I should see error messages relating to that field
    page.shouldShowErrorMessagesForFields(['crn'])
    page.completeForm(person.crn)

    // Given I am signed in and I have found someone to make a booking for by CRN
    // When I visit the new booking page
    const bookingCreatePage = new BookingNewPage()

    // And I miss the required fields
    cy.task('stubBookingErrors', {
      premisesId: premises.id,
      params: ['arrivalDate', 'departureDate'],
    })
    bookingCreatePage.clickSubmit()

    // Then I should see error messages relating to those fields
    page.shouldShowErrorMessagesForFields(['arrivalDate', 'departureDate'])
  })

  it('should allow me to see a booking', () => {
    // Given I am signed in
    cy.signIn()

    // And a booking is available
    const premises = premisesFactory.build()
    const booking = bookingFactory.build()
    cy.task('stubBookingGet', { premisesId: premises.id, booking })

    // When I navigate to the booking's manage page
    const page = BookingShowPage.visit(premises.id, booking)

    // Then I should see the details for that booking
    page.shouldShowBookingDetails(booking)
  })
})
