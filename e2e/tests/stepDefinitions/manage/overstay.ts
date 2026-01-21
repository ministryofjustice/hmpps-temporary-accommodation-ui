import { Given, Then } from '@badeball/cypress-cucumber-preprocessor'
import { fakerEN_GB as faker } from '@faker-js/faker'
import { addDays } from 'date-fns'
import Page from '../../../../cypress_shared/pages/page'
import BookingShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingShow'
import {
  cas3BookingFactory,
  cas3NewOverstayFactory,
  cas3OverstayFactory,
  newExtensionFactory,
} from '../../../../server/testutils/factories'
import BookingExtensionNewPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingExtensionNew'
import { DateFormats } from '../../../../server/utils/dateUtils'
import BookingOverstayNewPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingOverstayNew'
import BedspaceShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bedspaceShow'

Given('I report an overstay', () => {
  cy.then(function _() {
    const bookingShowPage = Page.verifyOnPage(BookingShowPage, this.premises, this.bedspace, this.booking)
    bookingShowPage.clickExtendBookingButton()

    const newDepartureDate = faker.date.soon({ days: 30, refDate: addDays(this.booking.arrivalDate, 85) })
    const newExtension = newExtensionFactory.build({
      newDepartureDate: DateFormats.dateObjToIsoDate(newDepartureDate),
    })

    const bookingExtensionPage = Page.verifyOnPage(BookingExtensionNewPage, this.premises, this.bedspace, this.booking)
    bookingExtensionPage.shouldShowBookingDetails()
    bookingExtensionPage.completeForm(newExtension)

    const newOverstay = cas3NewOverstayFactory.build({
      newDepartureDate: DateFormats.dateObjtoUIDate(newDepartureDate),
    })
    const overstay = cas3OverstayFactory.build({
      ...newOverstay,
      previousDepartureDate: this.booking.departureDate,
      bookingId: this.booking.id,
    })
    const bookingOverstayPage = Page.verifyOnPage(
      BookingOverstayNewPage,
      this.premises,
      this.bedspace,
      this.booking,
      newOverstay,
    )
    bookingOverstayPage.completeForm(newOverstay)

    const overstayBooking = cas3BookingFactory.build({
      ...this.booking,
      departureDate: newOverstay.newDepartureDate,
      overstays: [overstay],
    })

    cy.wrap(overstayBooking).as('booking')
    this.historicBookings.push(overstayBooking)
  })
})

Then('I should see the booking with the overstay', () => {
  cy.then(function _() {
    const bookingShowPage = Page.verifyOnPage(BookingShowPage, this.premises, this.bedspace, this.booking)
    bookingShowPage.shouldShowBanner('Booking departure date changed')
    bookingShowPage.shouldShowBookingDetails()
    bookingShowPage.shouldShowOverstay(this.booking.overstays[0])

    bookingShowPage.clickBreadCrumbUp()

    const bedspaceShowPage = Page.verifyOnPage(BedspaceShowPage, this.premises, this.bedspace)
    bedspaceShowPage.shouldShowBookingDetails(this.booking)
    bedspaceShowPage.shouldShowOverstay(this.booking, this.booking.overstays[0])
    bedspaceShowPage.clickBookingLink(this.booking)
  })
})
