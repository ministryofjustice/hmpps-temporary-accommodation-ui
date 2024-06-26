import { Given, Then } from '@badeball/cypress-cucumber-preprocessor'
import Page from '../../../../cypress_shared/pages/page'
import BedspaceEditPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bedspaceEdit'
import BedspaceNewPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bedspaceNew'
import BedspaceShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bedspaceShow'
import PremisesShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/premisesShow'
import { bedFactory, newRoomFactory, roomFactory, updateRoomFactory } from '../../../../server/testutils/factories'

Given("I'm creating a bedspace", () => {
  cy.get('@premises').then(premises => {
    const premisesShowPage = Page.verifyOnPage(PremisesShowPage, premises)
    premisesShowPage.clickAddBedspaceLink()

    const bedspaceNewPage = Page.verifyOnPage(BedspaceNewPage, premises)
    bedspaceNewPage.shouldShowBedspaceDetails()
  })
})

Given('I create a bedspace with all necessary details', () => {
  cy.get('@premises').then(premises => {
    const page = Page.verifyOnPage(BedspaceNewPage, premises)

    page.assignCharacteristics('characteristics')

    cy.then(function _() {
      const room = roomFactory.forEnvironment(this.characteristics).build({
        id: 'unknown',
        beds: [bedFactory.build({ bedEndDate: undefined })],
      })
      const newRoom = newRoomFactory.fromRoom(room).build({ bedEndDate: undefined })

      cy.wrap(room).as('room')
      page.completeForm(newRoom)
    })
  })
})

Given("I'm editing the bedspace", () => {
  cy.then(function _() {
    const bedspaceShowPage = Page.verifyOnPage(BedspaceShowPage, this.premises, this.room)
    bedspaceShowPage.clickBedspaceEditLink()

    const bedspaceEditPage = Page.verifyOnPage(BedspaceEditPage, this.premises, this.room)
    bedspaceEditPage.shouldShowBedspaceDetails()
  })
})

Given('I edit the bedspace details', () => {
  cy.then(function _() {
    const page = Page.verifyOnPage(BedspaceEditPage, this.premises, this.room)

    page.assignCharacteristics('characteristics')

    cy.then(function __() {
      const updatedRoom = roomFactory.forEnvironment(this.characteristics).build({
        id: this.room.id,
        name: this.room.name,
      })
      const updateRoom = updateRoomFactory.fromRoom(updatedRoom).build({ bedEndDate: updatedRoom.beds[0].bedEndDate })

      cy.wrap(updatedRoom).as('room')
      page.completeForm(updateRoom)
    })
  })
})

Then('I should see a confirmation for my new bedspace', () => {
  cy.then(function _() {
    const page = Page.verifyOnPage(BedspaceShowPage, this.premises, this.room)
    page.shouldShowBanner('Bedspace created')

    page.shouldShowBedspaceDetails()
    page.shouldShowPremisesAttributes()

    if (this.premises.status === 'archived') {
      page.shouldShowAsArchived()
    } else {
      page.shouldShowAsActive()
    }
  })
})

Then('I should see a confirmation for my updated bedspace', () => {
  cy.then(function _() {
    const page = Page.verifyOnPage(BedspaceShowPage, this.premises, this.room)
    page.shouldShowBanner('Bedspace updated')

    page.shouldShowBedspaceDetails()
    page.shouldShowPremisesAttributes()

    if (this.premises.status === 'archived') {
      page.shouldShowAsArchived()
    } else {
      page.shouldShowAsActive()
    }
  })
})
