import { Given, Then } from '@badeball/cypress-cucumber-preprocessor'

import throwMissingError from './utils'

import {
  BookingNewPage,
  BookingConfirmationPage,
  BookingFindPage,
  PremisesShowPage,
} from '../../../cypress_shared/pages/manage'

import bookingFactory from '../../../server/testutils/factories/booking'
import personFactory from '../../../server/testutils/factories/person'
import keyWorkerFactory from '../../../server/testutils/factories/keyWorker'

const keyWorkerName = Cypress.env('keyworker_name') || throwMissingError('keyworker_name')
const offenderName = Cypress.env('offender_name') || throwMissingError('offender_name')
const offenderCrn = Cypress.env('offender_crn') || throwMissingError('offender_crn')

const keyWorker = keyWorkerFactory.build({ name: keyWorkerName })
const person = personFactory.build({ name: offenderName, crn: offenderCrn })
const booking = bookingFactory.build({ keyWorker, person })

Given('I create a booking', () => {
  cy.get('@premisesShowPage').then((premisesShowPage: PremisesShowPage) => {
    premisesShowPage.clickCreateBookingOption()
  })

  const bookingNewPage = new BookingFindPage()
  bookingNewPage.enterCrn(person.crn)
  bookingNewPage.clickSubmit()

  const form = new BookingNewPage()

  form.verifyPersonIsVisible(person)
  form.completeForm(booking)
  form.clickSubmit()
})

Then('I should see a confirmation screen for my booking', () => {
  const page = new BookingConfirmationPage()

  page.verifyBookingIsVisible(booking)
})
