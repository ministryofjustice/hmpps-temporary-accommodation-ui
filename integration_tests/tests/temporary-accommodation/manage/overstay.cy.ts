import { addDays } from 'date-fns'
import Page from '../../../../cypress_shared/pages/page'
import BookingExtensionNewPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingExtensionNew'
import BookingShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingShow'
import BookingOverstayNewPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingOverstayNew'
import { setupBookingStateStubs } from '../../../../cypress_shared/utils/booking'
import { setupTestUser } from '../../../../cypress_shared/utils/setupTestUser'
import {
  cas3BookingFactory,
  cas3DepartureFactory,
  cas3NewDepartureFactory,
  cas3NewOverstayFactory,
  cas3OverstayFactory,
  newExtensionFactory,
} from '../../../../server/testutils/factories'
import { DateFormats } from '../../../../server/utils/dateUtils'
import Cas3NewOverstay from '../../../../server/testutils/factories/cas3NewOverstay'
import BookingDepartureNewPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingDepartureNew'
import BookingDepartureEditPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingDepartureEdit'

context('Booking overstay', () => {
  beforeEach(() => {
    cy.task('reset')
    setupTestUser('assessor')
  })

  it('allows me to record an overstay', () => {
    cy.signIn()

    const booking = cas3BookingFactory.arrived().build()
    const { premises, bedspace } = setupBookingStateStubs(booking)

    const bookingShow = BookingShowPage.visit(premises, bedspace, booking)
    bookingShow.clickExtendBookingButton()

    const extensionPage = Page.verifyOnPage(BookingExtensionNewPage, premises, bedspace, booking)

    const tooLateDepartureDate = DateFormats.dateObjToIsoDate(addDays(booking.departureDate, 85))
    const extension = newExtensionFactory.build({ newDepartureDate: tooLateDepartureDate })
    extensionPage.completeForm(extension)

    const overstay = cas3OverstayFactory.build({ newDepartureDate: tooLateDepartureDate })
    const overstayPage = Page.verifyOnPage(BookingOverstayNewPage, premises, bedspace, booking, overstay, false)

    const newOverstay = cas3NewOverstayFactory.build({ ...overstay })
    cy.task('stubOverstayCreate', { premisesId: premises.id, bookingId: booking.id, overstay: newOverstay })

    booking.overstays = [overstay]
    cy.task('stubBooking', { premisesId: premises.id, booking })

    overstayPage.completeForm(newOverstay)

    cy.task('verifyOverstayCreate', { premisesId: premises.id, bookingId: booking.id }).then(requests => {
      expect(requests).to.have.length(1)
      const requestBody = JSON.parse(requests[0].body)

      const normaliseNewlines = (value?: string) => (value || '').replace(/\r\n/g, '\n')

      expect(requestBody.newDepartureDate).equal(newOverstay.newDepartureDate)
      expect(requestBody.isAuthorised).equal(newOverstay.isAuthorised)
      expect(normaliseNewlines(requestBody.reason)).equal(normaliseNewlines(newOverstay.reason))
    })

    const bookingShowPage = Page.verifyOnPage(BookingShowPage, premises, bedspace, booking)
    bookingShowPage.shouldShowBanner('Booking departure date changed')
    bookingShowPage.shouldShowOverstay(newOverstay)
  })

  it('allows me to record an overstay for a departure', () => {
    cy.signIn()

    const eightySixDaysAgo = addDays(new Date(), -86)
    const yesterday = addDays(new Date(), -1)

    const booking = cas3BookingFactory.arrived().build({ arrivalDate: DateFormats.dateObjToIsoDate(eightySixDaysAgo) })
    const { premises, bedspace } = setupBookingStateStubs(booking)

    const bookingShow = BookingShowPage.visit(premises, bedspace, booking)
    cy.task('stubDepartureReferenceData')
    bookingShow.clickMarkDepartedBookingButton()

    const departure = cas3DepartureFactory.build({ dateTime: DateFormats.dateObjToIsoDateTime(yesterday) })
    const newDeparture = cas3NewDepartureFactory.build({
      ...departure,
      reasonId: departure.reason.id,
      moveOnCategoryId: departure.moveOnCategory.id,
    })

    const departurePage = Page.verifyOnPage(BookingDepartureNewPage, premises, bedspace, booking)
    departurePage.completeForm(newDeparture)

    const overstay = cas3OverstayFactory.build({ newDepartureDate: DateFormats.dateObjToIsoDate(yesterday) })
    const overstayPage = Page.verifyOnPage(BookingOverstayNewPage, premises, bedspace, booking, overstay, true)

    const newOverstay = Cas3NewOverstay.build({ ...overstay })
    cy.task('stubOverstayCreate', { premisesId: premises.id, bookingId: booking.id, overstay: newOverstay })
    cy.task('stubDepartureCreate', { premisesId: premises.id, bookingId: booking.id, departure })

    overstayPage.completeForm(newOverstay)

    cy.task('verifyOverstayCreate', { premisesId: premises.id, bookingId: booking.id }).then(requests => {
      expect(requests).to.have.length(1)
      const requestBody = JSON.parse(requests[0].body)

      const normaliseNewlines = (value?: string) => (value || '').replace(/\r\n/g, '\n')

      expect(requestBody.newDepartureDate).equal(newOverstay.newDepartureDate)
      expect(requestBody.isAuthorised).equal(newOverstay.isAuthorised)
      expect(normaliseNewlines(requestBody.reason)).equal(normaliseNewlines(newOverstay.reason))
    })

    cy.task('verifyDepartureCreate', { premisesId: premises.id, bookingId: booking.id }).then(requests => {
      expect(requests).to.have.length(1)
      const requestBody = JSON.parse(requests[0].body)
      expect(requestBody.dateTime).equal(newDeparture.dateTime)
      expect(requestBody.reasonId).equal(newDeparture.reasonId)
      expect(requestBody.moveOnCategoryId).equal(newDeparture.moveOnCategoryId)
      expect(requestBody.notes).equal(newDeparture.notes)
    })

    const bookingShowPage = Page.verifyOnPage(BookingShowPage, premises, bedspace, booking)
    bookingShowPage.shouldShowBanner('Booking marked as departed')
  })

  it('allows me to record an overstay when editing a departure', () => {
    cy.signIn()

    const arrivalDate = addDays(new Date(), -86)
    const initialDepartureDate = addDays(new Date(), -2)
    const newDepartureDate = addDays(new Date(), -1)

    const booking = cas3BookingFactory.departed().build({
      arrivalDate: DateFormats.dateObjToIsoDate(arrivalDate),
      departureDate: DateFormats.dateObjToIsoDate(initialDepartureDate),
    })
    const { premises, bedspace } = setupBookingStateStubs(booking)

    const bookingShow = BookingShowPage.visit(premises, bedspace, booking)
    cy.task('stubDepartureReferenceData')
    bookingShow.clickEditDepartedBookingButton()

    const departure = cas3DepartureFactory.build({ dateTime: DateFormats.dateObjToIsoDateTime(newDepartureDate) })
    const newDeparture = cas3NewDepartureFactory.build({
      ...departure,
      reasonId: departure.reason.id,
      moveOnCategoryId: departure.moveOnCategory.id,
    })

    const departurePage = Page.verifyOnPage(BookingDepartureEditPage, premises, bedspace, booking)
    departurePage.completeForm(newDeparture)

    const overstay = cas3OverstayFactory.build({ newDepartureDate: DateFormats.dateObjToIsoDate(newDepartureDate) })
    const overstayPage = Page.verifyOnPage(BookingOverstayNewPage, premises, bedspace, booking, overstay, true)

    const newOverstay = Cas3NewOverstay.build({ ...overstay })
    cy.task('stubOverstayCreate', { premisesId: premises.id, bookingId: booking.id, overstay: newOverstay })
    cy.task('stubDepartureCreate', { premisesId: premises.id, bookingId: booking.id, departure })

    overstayPage.completeForm(newOverstay)

    cy.task('verifyOverstayCreate', { premisesId: premises.id, bookingId: booking.id }).then(requests => {
      expect(requests).to.have.length(1)
      const requestBody = JSON.parse(requests[0].body)

      const normaliseNewlines = (value?: string) => (value || '').replace(/\r\n/g, '\n')

      expect(requestBody.newDepartureDate).equal(newOverstay.newDepartureDate)
      expect(requestBody.isAuthorised).equal(newOverstay.isAuthorised)
      expect(normaliseNewlines(requestBody.reason)).equal(normaliseNewlines(newOverstay.reason))
    })

    cy.task('verifyDepartureCreate', { premisesId: premises.id, bookingId: booking.id }).then(requests => {
      expect(requests).to.have.length(1)
      const requestBody = JSON.parse(requests[0].body)
      expect(requestBody.dateTime).equal(newDeparture.dateTime)
      expect(requestBody.reasonId).equal(newDeparture.reasonId)
      expect(requestBody.moveOnCategoryId).equal(newDeparture.moveOnCategoryId)
      expect(requestBody.notes).equal(newDeparture.notes)
    })

    const bookingShowPage = Page.verifyOnPage(BookingShowPage, premises, bedspace, booking)
    bookingShowPage.shouldShowBanner('Booking marked as departed')
  })

  it('redirects to the extension page when the server returns an error', () => {
    cy.signIn()

    const booking = cas3BookingFactory.arrived().build()
    const { premises, bedspace } = setupBookingStateStubs(booking)

    const bookingShow = BookingShowPage.visit(premises, bedspace, booking)
    bookingShow.clickExtendBookingButton()

    const extensionPage = Page.verifyOnPage(BookingExtensionNewPage, premises, bedspace, booking)

    const tooLateDepartureDate = DateFormats.dateObjToIsoDate(addDays(booking.departureDate, 85))
    const extension = newExtensionFactory.build({ newDepartureDate: tooLateDepartureDate })
    extensionPage.completeForm(extension)

    const newOverstay = cas3NewOverstayFactory.build({ newDepartureDate: tooLateDepartureDate })
    const overstayPage = Page.verifyOnPage(BookingOverstayNewPage, premises, bedspace, booking, newOverstay, false)

    const conflictingBooking = cas3BookingFactory.confirmed().build()
    cy.task('stubBooking', { premisesId: premises.id, booking: conflictingBooking })
    cy.task('stubOverstayCreateConflictError', {
      premisesId: premises.id,
      bookingId: booking.id,
      conflictingBookingId: conflictingBooking.id,
    })
    overstayPage.completeForm(newOverstay)

    const erroredExtensionPage = Page.verifyOnPage(BookingExtensionNewPage, premises, bedspace, booking)
    erroredExtensionPage.shouldShowDateConflictErrorMessages(conflictingBooking, 'booking')
  })

  it("returns to the overstay page if the user doesn't select whether the stay is authorised", () => {
    cy.signIn()

    const booking = cas3BookingFactory.arrived().build()
    const { premises, bedspace } = setupBookingStateStubs(booking)

    const bookingShow = BookingShowPage.visit(premises, bedspace, booking)
    bookingShow.clickExtendBookingButton()

    const extensionPage = Page.verifyOnPage(BookingExtensionNewPage, premises, bedspace, booking)

    const tooLateDepartureDate = DateFormats.dateObjToIsoDate(addDays(booking.departureDate, 85))
    const extension = newExtensionFactory.build({ newDepartureDate: tooLateDepartureDate })
    extensionPage.completeForm(extension)

    const newOverstay = cas3NewOverstayFactory.build({ newDepartureDate: tooLateDepartureDate })
    const overstayPage = Page.verifyOnPage(BookingOverstayNewPage, premises, bedspace, booking, newOverstay, false)

    overstayPage.enterReason(newOverstay.reason)
    overstayPage.clickSubmit()

    Page.verifyOnPage(BookingOverstayNewPage, premises, bedspace, booking, newOverstay, false)
    overstayPage.shouldShowIsAuthorisedErrorMessage()
  })
})
