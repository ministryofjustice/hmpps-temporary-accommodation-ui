import { Given } from '@badeball/cypress-cucumber-preprocessor'
import Page from '../../../../cypress_shared/pages/page'
import BedspaceNewPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bedspaceNew'
import BedspaceShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bedspaceShow'
import PremisesShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/premisesShow'
import { cas3BedspaceFactory, cas3NewBedspaceFactory } from '../../../../server/testutils/factories'

const knownActivePremisesId = 'f608aea9-52e8-4da0-ae33-f6b484de4dd7'
const knownActiveBedspaceId = 'f8455920-b835-4e67-bf10-4f89c538c60f'

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
        characteristicIds: bedspace.bedspaceCharacteristics.map(characteristic => characteristic.id),
        notes: bedspace.notes,
        startDate: bedspace.startDate,
      })
      cy.wrap(bedspace).as('bedspace')
      page.completeForm(newBedspace)

      cy.url().then(url => {
        bedspace.id = url.split('/').filter(Boolean).pop()
        cy.wrap(bedspace).as('bedspace')
      })
    })
  })
})

Given('I view an existing active bedspace', () => {
  PremisesShowPage.visitById(knownActivePremisesId)
  PremisesShowPage.getPremises('premises')

  BedspaceShowPage.visitById(knownActivePremisesId, knownActiveBedspaceId)
  BedspaceShowPage.getBedspace('bedspace')
})
