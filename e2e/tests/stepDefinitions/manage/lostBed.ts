import { Given, Then } from '@badeball/cypress-cucumber-preprocessor'
import Page from '../../../../cypress_shared/pages/page'
import BedspaceShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bedspaceShow'
import LostBedNewPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/lostBedNew'
import LostBedEditPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/lostBedEdit'
import LostBedCancelPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/lostBedCancel'
import newLostBedFactory from '../../../../server/testutils/factories/newLostBed'
import updateLostBedFactory from '../../../../server/testutils/factories/updateLostBed'
import lostBedFactory from '../../../../server/testutils/factories/lostBed'
import cancelLostBedFactory from '../../../../server/testutils/factories/newLostBedCancellation'
import LostBedShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/lostBedShow'

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

    const newLostBed = newLostBedFactory.build({ status: 'active' })
    const lostBed = lostBedFactory.build({ ...newLostBed })

    cy.wrap(lostBed).as('lostBed')
    lostBedNewPage.completeForm(newLostBed)
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

    const lostBedEditPage = Page.verifyOnPage(LostBedEditPage, this.premises, this.room, this.lostBed)
    const lostBedUpdate = updateLostBedFactory.build()
    cy.wrap(lostBedUpdate).as('lostBedUpdate')

    lostBedEditPage.clearForm()
    lostBedEditPage.completeForm(lostBedUpdate)
  })
})

Then('I should see confirmation for my updated void booking', () => {
  cy.then(function _() {
    const updatedLostBed = { ...this.lostBed, ...this.lostBedUpdate }
    const lostBedShowPage = Page.verifyOnPage(LostBedShowPage, this.premises, this.room, updatedLostBed)

    lostBedShowPage.shouldShowBanner('Void booking updated')
    lostBedShowPage.shouldShowLostBedDetails()

    lostBedShowPage.clickBreadCrumbUp()

    const bedspaceShowPage = Page.verifyOnPage(BedspaceShowPage, this.premises, this.room)
    bedspaceShowPage.shouldShowLostBedDetails(this.lostBedUpdate)
  })
})

Given('I attempt to edit the void booking with required details missing', () => {
  cy.then(function _() {
    const lostBedShowPage = Page.verifyOnPage(LostBedShowPage, this.premises, this.room, this.lostBed)
    lostBedShowPage.clickEditVoidLink()
    const lostBedEditPage = Page.verifyOnPage(LostBedEditPage, this.premises, this.room, this.lostBed)

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
    const lostBedCancellation = cancelLostBedFactory.build()
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
