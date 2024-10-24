import { Given, Then } from '@badeball/cypress-cucumber-preprocessor'
import { fakerEN_GB as faker } from '@faker-js/faker'
import Page from '../../../../cypress_shared/pages/page'
import BedspaceShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bedspaceShow'
import BookingExtensionNewPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingExtensionNew'
import BookingShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingShow'
import { bookingFactory, extensionFactory, newExtensionFactory } from '../../../../server/testutils/factories'
import { DateFormats } from '../../../../server/utils/dateUtils'

Given('I extend the booking', () => {
  cy.then(function _() {
    const bookingShowPage = Page.verifyOnPage(BookingShowPage, this.premises, this.room, this.booking)
    bookingShowPage.clickExtendBookingButton()

    const newExtension = newExtensionFactory.build({
      newDepartureDate: DateFormats.dateObjToIsoDate(
        faker.date.future({ years: 1, refDate: DateFormats.isoToDateObj(this.booking.arrivalDate) }),
      ),
    })
    const extension = extensionFactory.build({
      ...newExtension,
      previousDepartureDate: this.booking.departureDate,
    })

    const bookingExtensionPage = Page.verifyOnPage(BookingExtensionNewPage, this.premises, this.room, this.booking)
    bookingExtensionPage.shouldShowBookingDetails()
    bookingExtensionPage.completeForm(newExtension)

    const extendedBooking = bookingFactory.build({
      ...this.booking,
      departureDate: newExtension.newDepartureDate,
      extensions: [extension],
    })

    cy.wrap(extendedBooking).as('booking')
    this.historicBookings.push(extendedBooking)
  })
})

Given('I attempt to extend the booking with required details missing', () => {
  cy.then(function _() {
    const bookingShowPage = Page.verifyOnPage(BookingShowPage, this.premises, this.room, this.booking)
    bookingShowPage.clickExtendBookingButton()

    const bookingExtensionPage = Page.verifyOnPage(BookingExtensionNewPage, this.premises, this.room, this.booking)
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

    const bedspaceShowPage = Page.verifyOnPage(BedspaceShowPage, this.premises, this.room)
    bedspaceShowPage.shouldShowBookingDetails(this.booking)
    bedspaceShowPage.clickBookingLink(this.booking)
  })
})

Then('I should see a list of the problems encountered extending the booking', () => {
  cy.then(function _() {
    const page = Page.verifyOnPage(BookingExtensionNewPage, this.premises, this.room, this.booking)
    page.shouldShowErrorMessagesForFields(['newDepartureDate'])

    page.clickBack()
  })
})
