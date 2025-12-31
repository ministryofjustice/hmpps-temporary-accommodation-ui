import { addDays } from 'date-fns'
import Page from '../../../../cypress_shared/pages/page'
import BookingExtensionNewPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingExtensionNew'
import BookingShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingShow'
import BookingOverstayNewPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingOverstayNew'
import { setupBookingStateStubs } from '../../../../cypress_shared/utils/booking'
import { setupTestUser } from '../../../../cypress_shared/utils/setupTestUser'
import { cas3BookingFactory, cas3NewOverstayFactory, newExtensionFactory } from '../../../../server/testutils/factories'
import { DateFormats } from '../../../../server/utils/dateUtils'

context('Booking overstay', () => {
  beforeEach(() => {
    cy.task('reset')
    setupTestUser('assessor')
  })

  it('navigates to the overstay page via the booking extension page', () => {
    cy.signIn()

    const booking = cas3BookingFactory.arrived().build()
    const { premises, bedspace } = setupBookingStateStubs(booking)

    const bookingShow = BookingShowPage.visit(premises, bedspace, booking)
    bookingShow.clickExtendBookingButton()

    const extensionPage = Page.verifyOnPage(BookingExtensionNewPage, premises, bedspace, booking)

    const tooLateDepartureDate = DateFormats.dateObjToIsoDate(addDays(booking.departureDate, 85))

    const extension = newExtensionFactory.build({ newDepartureDate: tooLateDepartureDate })
    extensionPage.completeForm(extension)

    Page.verifyOnPage(BookingOverstayNewPage, premises, bedspace, booking)
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

    const overstayPage = Page.verifyOnPage(BookingOverstayNewPage, premises, bedspace, booking)

    const newOverstay = cas3NewOverstayFactory.build({ newDepartureDate: tooLateDepartureDate })
    cy.task('stubOverstayCreate', { premisesId: premises.id, bookingId: booking.id, overstay: newOverstay })

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
  })
})
