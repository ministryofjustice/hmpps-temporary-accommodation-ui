import { Given } from '@badeball/cypress-cucumber-preprocessor'
import Page from '../../../../cypress_shared/pages/page'
import BedspaceNewPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bedspaceNew'
import PremisesShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/premisesShow'
import { cas3BedspaceFactory } from '../../../../server/testutils/factories'

Given("I'm creating a bedspace", () => {
  cy.get('@premises').then(premises => {
    const premisesShowPage = Page.verifyOnPage(PremisesShowPage, premises.addressLine1)
    premisesShowPage.clickAddBedspaceLink()
    Page.verifyOnPage(BedspaceNewPage, premises)
  })
})

Given('I create a bedspace with all necessary details', () => {
  cy.get('@premises').then(premises => {
    const page = Page.verifyOnPage(BedspaceNewPage, premises)

    page.assignCharacteristics('characteristics')

    cy.then(function _() {
      const bedspace = cas3BedspaceFactory.forEnvironment(this.characteristics).build({
        endDate: undefined,
      })
      cy.wrap(bedspace).as('bedspace')
      page.completeForm(bedspace)
    })
  })
})
