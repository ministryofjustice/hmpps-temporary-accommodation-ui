// import { addDays } from 'date-fns'
// import Page from '../../../../cypress_shared/pages/page'
// import BookingArrivalNewPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingArrivalNew'
// import BookingArrivalEditPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingArrivalEdit'
// import BookingShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingShow'
// import { setupBookingStateStubs } from '../../../../cypress_shared/utils/booking'
import { setupTestUser } from '../../../../cypress_shared/utils/setupTestUser'
// import {
//   arrivalFactory,
//   bookingFactory,
//   newArrivalFactory,
//   premisesFactory,
//   roomFactory,
// } from '../../../../server/testutils/factories'
// import { DateFormats } from '../../../../server/utils/dateUtils'

context('Booking arrival', () => {
  beforeEach(() => {
    cy.task('reset')
    setupTestUser('assessor')
  })

  describe('New Arrival', () => {
    it('navigates to the booking arrival page', () => {
      // Given I am signed in
      cy.signIn()
      //
      //       // And there is a premises, a room, and a confirmed booking in the database
      //       const booking = bookingFactory.confirmed().build()
      //       const { premises, room } = setupBookingStateStubs(booking)
      //
      //       // When I visit the show booking page
      //       const bookingShow = BookingShowPage.visit(premises, room, booking)
      //
      //       // Add I click the marked arrived booking action
      //       bookingShow.clickMarkArrivedBookingButton()
      //
      //       // Then I navigate to the booking confirmation page
      //       Page.verifyOnPage(BookingArrivalNewPage, premises, room, booking)
    })
    //
    //     it('allows me to mark a booking as arrived', () => {
    //       // Given I am signed in
    //       cy.signIn()
    //
    //       // And there is a premises, a room, and a confirmed booking in the database
    //       const booking = bookingFactory.confirmed().build()
    //       const { premises, room } = setupBookingStateStubs(booking)
    //
    //       // When I visit the booking confirmation page
    //       const page = BookingArrivalNewPage.visit(premises, room, booking)
    //       page.shouldShowBookingDetails()
    //
    //       // And I fill out the form
    //       const arrival = arrivalFactory.build()
    //       const newArrival = newArrivalFactory.build({
    //         ...arrival,
    //       })
    //
    //       cy.task('stubArrivalCreate', { premisesId: premises.id, bookingId: booking.id, arrival })
    //
    //       page.completeForm(newArrival)
    //
    //       // Then the confirmation should have been created in the API
    //       cy.task('verifyArrivalCreate', { premisesId: premises.id, bookingId: booking.id }).then(requests => {
    //         expect(requests).to.have.length(1)
    //         const requestBody = JSON.parse(requests[0].body)
    //         expect(requestBody.arrivalDate).equal(newArrival.arrivalDate)
    //         expect(requestBody.expectedDepartureDate).equal(newArrival.expectedDepartureDate)
    //         expect(requestBody.notes).equal(newArrival.notes)
    //       })
    //
    //       // And I should be redirected to the show booking page
    //       const bookingShowPage = Page.verifyOnPage(BookingShowPage, premises, room, booking)
    //       bookingShowPage.shouldShowBanner('Booking marked as active')
    //     })
    //
    //     it('shows errors when the API returns an error', () => {
    //       // Given I am signed in
    //       cy.signIn()
    //
    //       // And there is a confirmed booking in the database
    //       const premises = premisesFactory.build()
    //       const room = roomFactory.build()
    //       const booking = bookingFactory.confirmed().build()
    //
    //       cy.task('stubSinglePremises', premises)
    //       cy.task('stubSingleRoom', { premisesId: premises.id, room })
    //       cy.task('stubBooking', { premisesId: premises.id, booking })
    //
    //       // When I visit the booking confirmation page
    //       const page = BookingArrivalNewPage.visit(premises, room, booking)
    //
    //       // And I miss required fields
    //       cy.task('stubArrivalCreateErrors', {
    //         premisesId: premises.id,
    //         bookingId: booking.id,
    //         params: ['arrivalDate', 'expectedDepartureDate'],
    //       })
    //       page.clearForm()
    //       page.clickSubmit()
    //
    //       // Then I should see error messages relating to those fields
    //       page.shouldShowErrorMessagesForFields(['arrivalDate', 'expectedDepartureDate'])
    //     })
    //
    //     it('shows errors when the API returns a 409 conflict error', () => {
    //       // Given I am signed in
    //       cy.signIn()
    //
    //       // And there is a confirmed booking and a conflicting booking in the database
    //       const premises = premisesFactory.build()
    //       const room = roomFactory.build()
    //       const booking = bookingFactory.confirmed().build()
    //       const conflictingBooking = bookingFactory.build()
    //
    //       cy.task('stubSinglePremises', premises)
    //       cy.task('stubSingleRoom', { premisesId: premises.id, room })
    //       cy.task('stubBooking', { premisesId: premises.id, booking })
    //       cy.task('stubBooking', { premisesId: premises.id, booking: conflictingBooking })
    //
    //       // When I visit the booking confirmation page
    //       const page = BookingArrivalNewPage.visit(premises, room, booking)
    //
    //       // And I fill out the form with dates that conflict with an existing booking
    //       const arrival = arrivalFactory.build()
    //       const newArrival = newArrivalFactory.build({
    //         ...arrival,
    //       })
    //       cy.task('stubArrivalCreateConflictError', {
    //         premisesId: premises.id,
    //         bookingId: booking.id,
    //         conflictingEntityId: conflictingBooking.id,
    //         conflictingEntityType: 'booking',
    //       })
    //
    //       page.completeForm(newArrival)
    //
    //       // Then I should see error messages for the conflict
    //       page.shouldShowDateConflictErrorMessages(conflictingBooking, 'booking')
    //     })
    //
    //     it('shows errors if arrival date is in future', () => {
    //       // Given I am signed in
    //       cy.signIn()
    //
    //       const currentDate = new Date()
    //       const futureDate = addDays(currentDate, 7)
    //
    //       // And there is a premises, a room, and a confirmed booking in the database
    //       const booking = bookingFactory.confirmed().build()
    //       const { premises, room } = setupBookingStateStubs(booking)
    //
    //       // When I visit the booking confirmation page
    //       const page = BookingArrivalNewPage.visit(premises, room, booking)
    //       page.shouldShowBookingDetails()
    //
    //       // And I fill out the form
    //       const arrival = arrivalFactory.build()
    //       const newArrival = newArrivalFactory.build({
    //         ...arrival,
    //         arrivalDate: DateFormats.dateObjToIsoDate(futureDate),
    //       })
    //
    //       page.completeForm(newArrival)
    //
    //       // Then I should see error messages relating to those fields
    //       page.shouldShowErrorMessagesForFields(['arrivalDate'], 'todayOrInThePast')
    //     })
    //
    //     it('navigates back from the booking arrival page to the show booking page', () => {
    //       // Given I am signed in
    //       cy.signIn()
    //
    //       // And there is a premises, a room, and a confirmed booking in the database
    //       const booking = bookingFactory.confirmed().build()
    //       const { premises, room } = setupBookingStateStubs(booking)
    //
    //       // When I visit the booking arrival page
    //       const page = BookingArrivalNewPage.visit(premises, room, booking)
    //
    //       // And I click the back link
    //       page.clickBack()
    //
    //       // Then I navigate to the show bedspace page
    //       Page.verifyOnPage(BookingShowPage, premises, room, booking)
    //     })
    //   })
    //
    //   describe('Update Arrival', () => {
    //     it('navigates to the booking arrival update page', () => {
    //       // Given I am signed in
    //       cy.signIn()
    //
    //       // And there is a premises, a room, and an active booking in the database
    //       const booking = bookingFactory.arrived().build()
    //       const { premises, room } = setupBookingStateStubs(booking)
    //
    //       // When I visit the show booking page
    //       const bookingShow = BookingShowPage.visit(premises, room, booking)
    //
    //       // Add I click the change arrival action
    //       bookingShow.clickEditArrivalButton()
    //
    //       // Then I navigate to the change arrival page
    //       Page.verifyOnPage(BookingArrivalEditPage, premises, room, booking)
    //     })
    //
    //     it('allows me to update an arrival', () => {
    //       // Given I am signed in
    //       cy.signIn()
    //
    //       // And there is a premises, a room, and an active booking in the database
    //       const booking = bookingFactory.arrived().build()
    //       const { premises, room } = setupBookingStateStubs(booking)
    //
    //       // When I visit the booking confirmation page
    //       const page = BookingArrivalEditPage.visit(premises, room, booking)
    //       page.shouldShowBookingDetails()
    //
    //       // And I fill out the form
    //       const newArrival = newArrivalFactory.build()
    //       cy.task('stubArrivalCreate', { premisesId: premises.id, bookingId: booking.id, arrival: newArrival })
    //       page.clearForm()
    //       page.completeForm(newArrival)
    //
    //       // Then the arrival should have been created in the API
    //       cy.task('verifyArrivalCreate', { premisesId: premises.id, bookingId: booking.id }).then(requests => {
    //         expect(requests).to.have.length(1)
    //         const requestBody = JSON.parse(requests[0].body)
    //         expect(requestBody.arrivalDate).equal(newArrival.arrivalDate)
    //         expect(requestBody.notes).equal(newArrival.notes)
    //       })
    //
    //       cy.then(() => {
    //         // And I should be redirected to the show booking page
    //         const bookingShowPage = Page.verifyOnPage(BookingShowPage, premises, room, booking)
    //         bookingShowPage.shouldShowBanner('Arrival updated')
    //       })
    //     })
    //
    //     it('shows errors when the API returns an error', () => {
    //       // Given I am signed in
    //       cy.signIn()
    //
    //       // And there is a confirmed booking in the database
    //       const premises = premisesFactory.build()
    //       const room = roomFactory.build()
    //       const booking = bookingFactory.arrived().build()
    //
    //       cy.task('stubSinglePremises', premises)
    //       cy.task('stubSingleRoom', { premisesId: premises.id, room })
    //       cy.task('stubBooking', { premisesId: premises.id, booking })
    //
    //       // When I visit the booking confirmation page
    //       const page = BookingArrivalEditPage.visit(premises, room, booking)
    //
    //       // And I miss required fields
    //       cy.task('stubArrivalCreateErrors', {
    //         premisesId: premises.id,
    //         bookingId: booking.id,
    //         params: ['arrivalDate'],
    //       })
    //       page.clearForm()
    //       page.clickSubmit()
    //
    //       // Then I should see error messages relating to those fields
    //       page.shouldShowErrorMessagesForFields(['arrivalDate'])
    //     })
    //
    //     it('shows errors when the API returns a 409 conflict error', () => {
    //       // Given I am signed in
    //       cy.signIn()
    //
    //       // And there is an arrived booking and a conflicting booking in the database
    //       const premises = premisesFactory.build()
    //       const room = roomFactory.build()
    //       const booking = bookingFactory.arrived().build()
    //       const conflictingBooking = bookingFactory.build()
    //
    //       cy.task('stubSinglePremises', premises)
    //       cy.task('stubSingleRoom', { premisesId: premises.id, room })
    //       cy.task('stubBooking', { premisesId: premises.id, booking })
    //       cy.task('stubBooking', { premisesId: premises.id, booking: conflictingBooking })
    //
    //       // When I visit the booking confirmation page
    //       const page = BookingArrivalEditPage.visit(premises, room, booking)
    //
    //       // And I fill out the form with dates that conflict with an existing booking
    //       const newArrival = newArrivalFactory.build()
    //       cy.task('stubArrivalCreateConflictError', {
    //         premisesId: premises.id,
    //         bookingId: booking.id,
    //         conflictingEntityId: conflictingBooking.id,
    //         conflictingEntityType: 'booking',
    //       })
    //
    //       page.completeForm(newArrival)
    //
    //       // Then I should see error messages for the conflict
    //       page.shouldShowDateConflictErrorMessages(conflictingBooking, 'booking')
    //     })
    //
    //     it('shows errors if arrival date is in future', () => {
    //       // Given I am signed in
    //       cy.signIn()
    //
    //       const currentDate = new Date()
    //       const futureDate = addDays(currentDate, 7)
    //
    //       // And there is a confirmed booking in the database
    //       const premises = premisesFactory.build()
    //       const room = roomFactory.build()
    //       const booking = bookingFactory.arrived().build()
    //
    //       cy.task('stubSinglePremises', premises)
    //       cy.task('stubSingleRoom', { premisesId: premises.id, room })
    //       cy.task('stubBooking', { premisesId: premises.id, booking })
    //
    //       // When I visit the booking confirmation page
    //       const page = BookingArrivalEditPage.visit(premises, room, booking)
    //
    //       // And I fill out the form
    //       const newArrival = newArrivalFactory.build()
    //       newArrival.arrivalDate = DateFormats.dateObjToIsoDate(futureDate)
    //       cy.task('stubArrivalCreate', { premisesId: premises.id, bookingId: booking.id, arrival: newArrival })
    //       page.clearForm()
    //       page.completeForm(newArrival)
    //
    //       // Then I should see error messages relating to those fields
    //       page.shouldShowErrorMessagesForFields(['arrivalDate'], 'todayOrInThePast')
    //     })
    //
    //     it('navigates back from the booking arrival page to the show booking page', () => {
    //       // Given I am signed in
    //       cy.signIn()
    //
    //       // And there is a premises, a room, and a confirmed booking in the database
    //       const booking = bookingFactory.arrived().build()
    //       const { premises, room } = setupBookingStateStubs(booking)
    //
    //       // When I visit the booking arrival page
    //       const page = BookingArrivalEditPage.visit(premises, room, booking)
    //
    //       // And I click the back link
    //       page.clickBack()
    //
    //       // Then I navigate to the show bedspace page
    //       Page.verifyOnPage(BookingShowPage, premises, room, booking)
    //     })
  })
})
