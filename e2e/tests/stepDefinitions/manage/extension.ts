import { Given, Then } from '@badeball/cypress-cucumber-preprocessor'
import { faker } from '@faker-js/faker/locale/en_GB'
import Page from '../../../../cypress_shared/pages/page'
import BedspaceShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bedspaceShow'
import BookingShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingShow'
import BookingExtensionNewPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingExtensionNew'
import bookingFactory from '../../../../server/testutils/factories/booking'
import extensionFactory from '../../../../server/testutils/factories/extension'
import newExtensionFactory from '../../../../server/testutils/factories/newExtension'
import { DateFormats } from '../../../../server/utils/dateUtils'

Given('I extend the booking', () => {
  cy.then(function _() {
    const bookingShowPage = Page.verifyOnPage(BookingShowPage, this.premises, this.room, this.booking)
    bookingShowPage.clickExtendBookingButton()

    const newExtension = newExtensionFactory.build({
      newDepartureDate: DateFormats.formatApiDate(
        faker.date.future(1, DateFormats.convertIsoToDateObj(this.booking.arrivalDate)),
      ),
    })
    const extension = extensionFactory.build({
      ...newExtension,
    })

    const bookingExtensionPage = Page.verifyOnPage(BookingExtensionNewPage, this.booking)
    bookingExtensionPage.shouldShowBookingDetails()
    bookingExtensionPage.completeForm(newExtension)

    const extendedBooking = bookingFactory.build({
      ...this.booking,
      departureDate: newExtension.newDepartureDate,
      extensions: [extension],
    })

    cy.wrap(extendedBooking).as('booking')
  })
})

Given('I attempt to extend the booking with required details missing', () => {
  cy.then(function _() {
    const bookingShowPage = Page.verifyOnPage(BookingShowPage, this.premises, this.room, this.booking)
    bookingShowPage.clickExtendBookingButton()

    const bookingExtensionPage = Page.verifyOnPage(
      BookingExtensionNewPage,
      this.premises.id,
      this.room.id,
      this.booking,
    )
    bookingExtensionPage.clearForm()
    bookingExtensionPage.clickSubmit()
  })
})

Then('I should see the booking with the extended departure date', () => {
  cy.then(function _() {
    const bookingShowPage = Page.verifyOnPage(BookingShowPage, this.premises, this.room, this.booking)
    bookingShowPage.shouldShowBanner('Booking departure date changed')
    bookingShowPage.shouldShowBookingDetails()

    bookingShowPage.clickBreadCrumbUp()

    const bedspaceShowPage = Page.verifyOnPage(BedspaceShowPage, this.room)
    bedspaceShowPage.shouldShowBookingDetails(this.booking)
  })
})

Then('I should see a list of the problems encountered extending the booking', () => {
  cy.then(function _() {
    const page = Page.verifyOnPage(BookingExtensionNewPage, this.premises.id, this.room.id, this.booking)

    page.shouldShowErrorMessagesForFields(['newDepartureDate'])
  })
})
