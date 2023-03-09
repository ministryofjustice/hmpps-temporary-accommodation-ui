import { Given, Then } from '@badeball/cypress-cucumber-preprocessor'
import Page from '../../../../cypress_shared/pages/page'
import BedspaceShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bedspaceShow'
import LostBedNewPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/lostBedNew'
import newLostBedFactory from '../../../../server/testutils/factories/newLostBed'
import lostBedFactory from '../../../../server/testutils/factories/lostBed'
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
