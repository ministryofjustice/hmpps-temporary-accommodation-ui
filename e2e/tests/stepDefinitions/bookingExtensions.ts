import { Given, Then } from '@badeball/cypress-cucumber-preprocessor'

import {
  PremisesShowPage,
  BookingShowPage,
  BookingExtensionCreatePage,
  BookingExtensionConfirmationPage,
} from '../../../cypress_shared/pages/manage'

import { DateFormats } from '../../../server/utils/dateUtils'

const extensionDate = DateFormats.formatApiDate(new Date(2050, 0, 1))

Given('I extend a booking', () => {
  cy.get('@premisesShowPage').then((premisesShowPage: PremisesShowPage) => {
    premisesShowPage.selectBooking()
  })

  const bookingShowPage = new BookingShowPage()
  bookingShowPage.clickExtendBooking()

  const bookingExtensionCreatePage = new BookingExtensionCreatePage()

  bookingExtensionCreatePage.completeForm(extensionDate)
  bookingExtensionCreatePage.clickSubmit()
})

Then('I should see a message on the booking page confirming the extension', () => {
  const bookingExtensionCreatePage = new BookingExtensionConfirmationPage()
  bookingExtensionCreatePage.verifyNewExpectedDepartureDate(extensionDate)
})

Then('I attempt to extend a booking without entering the date', () => {
  cy.get('@premisesShowPage').then((premisesShowPage: PremisesShowPage) => {
    premisesShowPage.selectBooking()
  })

  const bookingShowPage = new BookingShowPage()
  bookingShowPage.clickExtendBooking()

  const bookingExtensionCreatePage = new BookingExtensionCreatePage()

  bookingExtensionCreatePage.clickSubmit()
})

Then('I should see an error', () => {
  const bookingExtensionCreatePage = new BookingExtensionCreatePage()
  bookingExtensionCreatePage.shouldShowErrorMessagesForFields(['newDepartureDate'])
})
