import { Given, Then } from '@badeball/cypress-cucumber-preprocessor'
import Page from '../../../../cypress_shared/pages/page'
import BedspaceEditPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bedspaceEdit'
import BedspaceNewPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bedspaceNew'
import BedspaceShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bedspaceShow'
import PremisesShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/premisesShow'
import newRoomFactory from '../../../../server/testutils/factories/newRoom'
import roomFactory from '../../../../server/testutils/factories/room'
import updateRoomFactory from '../../../../server/testutils/factories/updateRoom'

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

    const room = roomFactory.build({
      id: 'unknown',
    })

    const newRoom = newRoomFactory.build({
      ...room,
      characteristicIds: room.characteristics.map(characteristic => characteristic.id),
    })

    cy.wrap(room).as('room')
    page.completeForm(newRoom)
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

    const updatedRoom = roomFactory.build({
      id: this.room.id,
      name: this.room.name,
    })

    const updateRoom = updateRoomFactory.build({
      ...updatedRoom,
      characteristicIds: updatedRoom.characteristics.map(characteristic => characteristic.id),
    })

    cy.wrap(updatedRoom).as('room')
    page.completeForm(updateRoom)
  })
})

Then('I should see a confirmation for my new bedspace', () => {
  cy.then(function _() {
    const page = Page.verifyOnPage(BedspaceShowPage, this.premises, this.room)
    page.shouldShowBanner('Bedspace created')

    page.shouldShowBedspaceDetails()
  })
})

Then('I should see a confirmation for my updated bedspace', () => {
  cy.then(function _() {
    const page = Page.verifyOnPage(BedspaceShowPage, this.premises, this.room)
    page.shouldShowBanner('Bedspace updated')

    page.shouldShowBedspaceDetails()
  })
})
