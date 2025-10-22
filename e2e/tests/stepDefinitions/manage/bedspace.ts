import { Given } from '@badeball/cypress-cucumber-preprocessor'
import Page from '../../../../cypress_shared/pages/page'
import BedspaceNewPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bedspaceNew'
import PremisesShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/premisesShow'
import { cas3BedspaceFactory, cas3NewBedspaceFactory } from '../../../../server/testutils/factories'

Given("I'm creating a bedspace", () => {
  cy.get('@premises').then(premises => {
    const premisesShowPage = Page.verifyOnPage(PremisesShowPage, premises)
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
        startDate: undefined,
      })
      const newBedspace = cas3NewBedspaceFactory.build({
        reference: bedspace.reference,
        characteristicIds: bedspace.characteristics.map(characteristic => characteristic.id),
        notes: bedspace.notes,
        startDate: bedspace.startDate,
      })
      cy.wrap(bedspace).as('bedspace')
      page.completeForm(newBedspace)
    })
  })
})
