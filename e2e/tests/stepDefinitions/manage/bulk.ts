import { Given } from '@badeball/cypress-cucumber-preprocessor'
import Page from '../../../../cypress_shared/pages/page'
import BedspaceNewPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bedspaceNew'
import PremisesNewPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/premisesNew'
import BookingNewPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingNew'
import BookingConfirmPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingConfirm'
import BookingSelectAssessment from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingSelectAssessment'

import {
  bookingFactory,
  newBookingFactory,
  newPremisesFactory,
  newRoomFactory,
  premisesFactory,
  roomFactory,
  turnaroundFactory,
} from '../../../../server/testutils/factories'
import { getUrlEncodedCypressEnv, person, throwMissingCypressEnvError } from '../utils'

const actingUserProbationRegionId =
  Cypress.env('acting_user_probation_region_id') || throwMissingCypressEnvError('acting_user_probation_region_id')

const actingUserProbationRegionName =
  getUrlEncodedCypressEnv('acting_user_probation_region_name') ||
  throwMissingCypressEnvError('acting_user_probation_region_name')

const actingUserProbationRegion = { id: actingUserProbationRegionId, name: actingUserProbationRegionName }

/*
 * This function creates one or more premises, each with one or more rooms, which are then booked out.
 */
// eslint-disable-next-line
const bookingCreator = (type: string = 'provisional', nPremises: number = 1, nRooms: number = 1) => {
  Array.from(Array(nPremises)).forEach(() => {
    cy.visit('/properties/new').then(function newProperty() {
      const newPremisesPage = Page.verifyOnPage(PremisesNewPage)
      newPremisesPage.assignPdus('pdus')
      newPremisesPage.assignLocalAuthorities('localAuthorities')
      newPremisesPage.assignCharacteristics('characteristics')

      cy.then(function assignChars() {
        // add premises
        const premises = premisesFactory
          .forEnvironment(actingUserProbationRegion, this.pdus, this.localAuthorities, this.characteristics)
          .active()
          .build({
            id: 'unknown',
          })

        newPremisesPage.shouldPreselectProbationRegion(premises.probationRegion)
        const newPremises = newPremisesFactory.fromPremises(premises).build()
        cy.wrap(premises).as('premises')
        newPremisesPage.completeForm(newPremises)

        cy.url().then((premisesUrl: string) => {
          const bedspacesUrl = `${premisesUrl}/bedspaces`

          Array.from(Array(nRooms)).forEach((_, id) => {
            cy.visit(`${bedspacesUrl}/new`).then(function bedSpaces() {
              const bedspacePage = Page.verifyOnPage(BedspaceNewPage, premises)
              bedspacePage.assignCharacteristics('characteristics')

              cy.then(function roomNew() {
                const room = roomFactory.forEnvironment(this.characteristics).build({
                  id,
                })
                const newRoom = newRoomFactory.fromRoom(room).build()
                bedspacePage.completeForm(newRoom)
                cy.wrap(room).as('room')

                // book out the room
                cy.url().then(function bookItOut(url) {
                  cy.visit(`${url}/bookings/new`).then(function bookingNew() {
                    const bookingNewPage = Page.verifyOnPage(BookingNewPage, this.premises, this.room)
                    bookingNewPage.assignTurnaroundDays('turnaroundDays')

                    cy.then(function fNewBooking() {
                      const newBooking = newBookingFactory.build({
                        crn: person.crn,
                      })

                      const booking = bookingFactory[type]().build({
                        ...newBooking,
                        person,
                        turnaround: turnaroundFactory.build({
                          workingDays: this.turnaroundDays,
                        }),
                        effectiveEndDate: 'unknown',
                        turnaroundStartDate: 'unknown',
                      })
                      booking.assessmentId = undefined

                      bookingNewPage.completeForm(newBooking)

                      BookingSelectAssessment.assignAssessmentSummaries('assessments')

                      cy.get('@assessments').then(assessments => {
                        const bookingSelectAssessmentPage = Page.verifyOnPage(BookingSelectAssessment, assessments)
                        if (assessments.length) {
                          bookingSelectAssessmentPage.selectNoAssessment()
                        }
                        bookingSelectAssessmentPage.clickSubmit()

                        const bookingConfirmPage = Page.verifyOnPage(
                          BookingConfirmPage,
                          this.premises,
                          this.room,
                          person,
                        )
                        bookingConfirmPage.shouldShowBookingDetails()

                        bookingConfirmPage.clickSubmit()
                      })
                    })
                  })
                })
              })
            })
          })
        })
      })
    })
  })
}

// The bookings are now populated by the api in dev, but leaving the bulk() helper for
// future use (thinking performance testing)
Given('enough provisional bookings exists for several pages of results', () => {
  return null
})
