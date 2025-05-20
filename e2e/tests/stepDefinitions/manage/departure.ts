import { Given, Then } from '@badeball/cypress-cucumber-preprocessor'
import { fakerEN_GB as faker } from '@faker-js/faker'
import Page from '../../../../cypress_shared/pages/page'
import BedspaceShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bedspaceShow'
import BookingDepartureEditPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingDepartureEdit'
import BookingDepartureNewPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingDepartureNew'
import BookingShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingShow'
import { bookingFactory, departureFactory, newDepartureFactory } from '../../../../server/testutils/factories'
import { DateFormats } from '../../../../server/utils/dateUtils'
import { BookingStatus } from '../../../../server/@types/ui/index'

Given('I mark the booking as departed', () => {
  cy.then(function _() {
    const bookingShowPage = Page.verifyOnPage(BookingShowPage, this.premises, this.room, this.booking)
    bookingShowPage.clickMarkDepartedBookingButton()

    const departure = departureFactory.build({
      dateTime: DateFormats.dateObjToIsoDate(
        faker.date.between({
          from: DateFormats.isoToDateObj(this.booking.arrivalDate),
          to: new Date(),
        }),
      ),
    })
    const newDeparture = newDepartureFactory.build({
      ...departure,
      reasonId: departure.reason.id,
      moveOnCategoryId: departure.moveOnCategory.id,
    })

    const bookingDeparturePage = Page.verifyOnPage(BookingDepartureNewPage, this.premises, this.room, this.booking)
    bookingDeparturePage.shouldShowBookingDetails()
    bookingDeparturePage.completeForm(newDeparture)

    const departedBooking = bookingFactory.build({
      ...this.booking,
      status: 'unknown-departed-or-closed' as BookingStatus,
      departureDate: newDeparture.dateTime,
      departure,
    })

    cy.wrap(departedBooking).as('booking')
    this.historicBookings.push(departedBooking)
  })
})

Given('I attempt to mark the booking as departed with required details missing', () => {
  cy.then(function _() {
    const bookingShowPage = Page.verifyOnPage(BookingShowPage, this.premises, this.room, this.booking)
    bookingShowPage.clickMarkDepartedBookingButton()

    const bookingDeparturePage = Page.verifyOnPage(BookingDepartureNewPage, this.premises, this.room, this.booking)
    bookingDeparturePage.clickSubmit()
  })
})

Given('I edit the departed booking', () => {
  cy.then(function _() {
    const bookingShowPage = Page.verifyOnPage(BookingShowPage, this.premises, this.room, this.booking)
    bookingShowPage.clickEditDepartedBookingButton()

    const departure = departureFactory.build({
      dateTime: DateFormats.dateObjToIsoDate(
        faker.date.future({ years: 1, refDate: DateFormats.isoToDateObj(this.booking.arrivalDate) }),
      ),
    })
    const newDeparture = newDepartureFactory.build({
      ...departure,
      reasonId: departure.reason.id,
      moveOnCategoryId: departure.moveOnCategory.id,
    })

    const bookingDeparturePage = Page.verifyOnPage(BookingDepartureEditPage, this.premises, this.room, this.booking)
    bookingDeparturePage.shouldShowBookingDetails()
    bookingDeparturePage.completeForm(newDeparture)

    const departedBooking = bookingFactory.build({
      ...this.booking,
      departureDate: newDeparture.dateTime,
      departure,
      status: 'unknown-departed-or-closed' as BookingStatus,
    })

    cy.wrap(departedBooking).as('booking')
    this.historicBookings.push(departedBooking)
  })
})

Given('I attempt to edit the departed booking with required details missing', () => {
  cy.then(function _() {
    const bookingShowPage = Page.verifyOnPage(BookingShowPage, this.premises, this.room, this.booking)
    bookingShowPage.clickEditDepartedBookingButton()

    const bookingDeparturePage = Page.verifyOnPage(BookingDepartureEditPage, this.premises, this.room, this.booking)
    bookingDeparturePage.clearForm()
    bookingDeparturePage.clickSubmit()
  })
})

Then('I should see the booking with the departed status', () => {
  cy.then(function _() {
    const bookingShowPage = Page.verifyOnPage(BookingShowPage, this.premises, this.room, this.booking)
    bookingShowPage.shouldShowBanner('Booking marked as departed')
    bookingShowPage.shouldShowBookingDetails()

    bookingShowPage.clickBreadCrumbUp()

    const bedspaceShowPage = Page.verifyOnPage(BedspaceShowPage, this.premises, this.room)
    bedspaceShowPage.shouldShowBookingDetails(this.booking)
    bedspaceShowPage.clickBookingLink(this.booking)
  })
})

Then('I should see the booking with the edited departure details', () => {
  cy.then(function _() {
    const bookingShowPage = Page.verifyOnPage(BookingShowPage, this.premises, this.room, this.booking)
    bookingShowPage.shouldShowBanner('Departure details changed')
    bookingShowPage.shouldShowBookingDetails()

    bookingShowPage.clickBreadCrumbUp()

    const bedspaceShowPage = Page.verifyOnPage(BedspaceShowPage, this.premises, this.room)
    bedspaceShowPage.shouldShowBookingDetails(this.booking)
    bedspaceShowPage.clickBookingLink(this.booking)
  })
})

Then('I should see a list of the problems encountered marking the booking as departed', () => {
  cy.then(function _() {
    const page = Page.verifyOnPage(BookingDepartureNewPage, this.premises, this.room, this.booking)
    page.shouldShowErrorMessagesForFields(['dateTime', 'reasonId', 'moveOnCategoryId'])

    page.clickBack()
  })
})

Then('I should see a list of the problems encountered editing the departed booking', () => {
  cy.then(function _() {
    const page = Page.verifyOnPage(BookingDepartureEditPage, this.premises, this.room, this.booking)
    page.shouldShowErrorMessagesForFields(['dateTime', 'reasonId', 'moveOnCategoryId'])

    page.clickBack()
  })
})
