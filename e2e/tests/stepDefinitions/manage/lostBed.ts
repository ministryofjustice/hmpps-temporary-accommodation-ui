import { Given, Then } from '@badeball/cypress-cucumber-preprocessor'
import Page from '../../../../cypress_shared/pages/page'
import BedspaceShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bedspaceShow'
import LostBedCancelPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/lostBedCancel'
import LostBedEditPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/lostBedEdit'
import LostBedNewPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/lostBedNew'
import LostBedShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/lostBedShow'
import {
  lostBedCancellationFactory,
  lostBedFactory,
  newLostBedFactory,
  updateLostBedFactory,
} from '../../../../server/testutils/factories'

Given(`I'm marking a bedspace as void`, () => {
  cy.then(function _() {
    const bedspaceShowPage = Page.verifyOnPage(BedspaceShowPage, this.premises, this.room)
    bedspaceShowPage.clickVoidBedspaceLink()

    const lostBedNewPage = Page.verifyOnPage(LostBedNewPage, this.premises, this.room)
    lostBedNewPage.shouldShowBedspaceDetails()
  })
})

Given('I create a void booking with all necessary details', () => {
  cy.then(function _() {
    const lostBedNewPage = Page.verifyOnPage(LostBedNewPage, this.premises, this.room)
    lostBedNewPage.assignReasons('reasons')

    cy.then(function __() {
      const lostBed = lostBedFactory.forEnvironment(this.reasons).active().build({
        id: 'unknown',
      })

      const newLostBed = newLostBedFactory.build({
        ...lostBed,
        reason: lostBed.reason.id,
      })

      cy.wrap(lostBed).as('lostBed')
      lostBedNewPage.completeForm(newLostBed)
    })
  })
})

Then('I should see a confirmation for my new void booking', () => {
  cy.then(function _() {
    const lostBedShowPage = Page.verifyOnPage(LostBedShowPage, this.premises, this.room, this.lostBed)
    lostBedShowPage.shouldShowBanner('Void created')
    lostBedShowPage.shouldShowLostBedDetails()

    lostBedShowPage.clickBreadCrumbUp()

    const bedspaceShowPage = Page.verifyOnPage(BedspaceShowPage, this.premises, this.room)
    bedspaceShowPage.shouldShowLostBedDetails(this.lostBed)
  })
})

Given('I attempt to mark a bedspace as void with required details missing', () => {
  cy.then(function _() {
    const lostBedNewPage = Page.verifyOnPage(LostBedNewPage, this.premises, this.room)
    lostBedNewPage.clickSubmit()
  })
})

Then('I should see a list of the problems encountered voiding the bedspace', () => {
  cy.then(function _() {
    const lostBedNewPage = Page.verifyOnPage(LostBedNewPage, this.premises, this.room)
    lostBedNewPage.shouldShowErrorMessagesForFields(['startDate', 'endDate'])
  })
})

Given('I edit the void booking', () => {
  cy.then(function _() {
    const lostBedShowPage = Page.verifyOnPage(LostBedShowPage, this.premises, this.room, this.lostBed)
    lostBedShowPage.clickEditVoidLink()

    const lostBedEditPage = Page.verifyOnPage(LostBedEditPage, this.premises, this.room)
    lostBedEditPage.assignReasons('reasons')

    cy.then(function __() {
      const updatedLostBed = lostBedFactory.forEnvironment(this.reasons).active().build({
        id: this.lostBed.id,
      })

      const updateLostBed = updateLostBedFactory.build({
        ...updatedLostBed,
        reason: updatedLostBed.reason.id,
      })

      cy.wrap(updatedLostBed).as('lostBed')
      lostBedEditPage.clearForm()
      lostBedEditPage.completeForm(updateLostBed)
    })
  })
})

Then('I should see confirmation for my updated void booking', () => {
  cy.then(function _() {
    const lostBedShowPage = Page.verifyOnPage(LostBedShowPage, this.premises, this.room, this.lostBed)

    lostBedShowPage.shouldShowBanner('Void booking updated')
    lostBedShowPage.shouldShowLostBedDetails()

    lostBedShowPage.clickBreadCrumbUp()

    const bedspaceShowPage = Page.verifyOnPage(BedspaceShowPage, this.premises, this.room)
    bedspaceShowPage.shouldShowLostBedDetails(this.lostBed)
  })
})

Given('I attempt to edit the void booking with required details missing', () => {
  cy.then(function _() {
    const lostBedShowPage = Page.verifyOnPage(LostBedShowPage, this.premises, this.room, this.lostBed)
    lostBedShowPage.clickEditVoidLink()
    const lostBedEditPage = Page.verifyOnPage(LostBedEditPage, this.premises, this.room)

    lostBedEditPage.clearForm()
    lostBedEditPage.clickSubmit()
    lostBedEditPage.shouldShowErrorMessagesForFields(['startDate', 'endDate'])
  })
})

Given('I cancel the void booking', () => {
  cy.then(function _() {
    const lostBedShowPage = Page.verifyOnPage(LostBedShowPage, this.premises, this.room, this.lostBed)
    lostBedShowPage.clickCancelVoidLink()

    const lostBedCancelPage = Page.verifyOnPage(LostBedCancelPage, this.premises, this.room, this.lostBed)
    const lostBedCancellation = lostBedCancellationFactory.build()
    cy.wrap(lostBedCancellation).as('lostBedCancellation')

    lostBedCancelPage.clearForm()
    lostBedCancelPage.completeForm(lostBedCancellation)
  })
})

Then('I should see confirmation that the void is cancelled', () => {
  cy.then(function _() {
    const cancelledLostBed = { ...this.lostBed, status: 'cancelled', cancellation: this.lostBedCancellation }
    const lostBedShowPage = Page.verifyOnPage(LostBedShowPage, this.premises, this.room, cancelledLostBed)

    lostBedShowPage.shouldShowBanner('Void booking cancelled')
    lostBedShowPage.shouldShowLostBedDetails()
  })
})

Given('I attempt to create a conflicting void booking', () => {
  cy.then(function _() {
    const lostBedNewPage = Page.verifyOnPage(LostBedNewPage, this.premises, this.room)
    const newLostBed = newLostBedFactory.build({ ...this.lostBed, reason: this.lostBed.reason.id })
    lostBedNewPage.completeForm(newLostBed)
  })
})

Then('I should see errors for the conflicting void booking', () => {
  cy.then(function _() {
    const lostBedNewPage = Page.verifyOnPage(LostBedNewPage, this.premises, this.room)
    lostBedNewPage.shouldShowDateConflictErrorMessages(this.lostBed, 'lost-bed')
  })
})
