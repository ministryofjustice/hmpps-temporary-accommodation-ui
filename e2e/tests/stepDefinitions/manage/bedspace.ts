import type { Room } from '@approved-premises/api'
import { Given, Then } from '@badeball/cypress-cucumber-preprocessor'
import roomFactory from '../../../../server/testutils/factories/room'
import newRoomFactory from '../../../../server/testutils/factories/newRoom'
import updateRoomFactory from '../../../../server/testutils/factories/updateRoom'
import BedspaceNewPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bedspaceNew'
import PremisesShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/premisesShow'
import BedspaceEditPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bedspaceEdit'
import BedspaceShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bedspaceShow'
import Page from '../../../../cypress_shared/pages/page'

Given("I'm creating a bedspace", () => {
  cy.get('@premises').then(premises => {
    const page = Page.verifyOnPage(PremisesShowPage, premises)
    page.clickAddBedspaceLink()
  })
})

Given('I create a bedspace with all necessary details', () => {
  const page = Page.verifyOnPage(BedspaceNewPage)

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

Given("I'm editing the bedspace", () => {
  cy.then(function _() {
    const bedspaceShowPage = Page.verifyOnPage(BedspaceShowPage, this.room)
    bedspaceShowPage.clickBedspaceEditLink()

    const bedspaceEditPage = Page.verifyOnPage(BedspaceEditPage, this.room)
    bedspaceEditPage.shouldShowBedspaceDetails()
  })
})

Given('I edit the bedspace details', () => {
  cy.get('@room').then((room: Room) => {
    const page = Page.verifyOnPage(BedspaceEditPage, room)

    const updatedRoom = roomFactory.build({
      id: room.id,
      name: room.name,
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
  cy.get('@room').then(room => {
    const page = Page.verifyOnPage(BedspaceShowPage, room)
    page.shouldShowBanner('Bedspace created')

    page.shouldShowBedspaceDetails()
  })
})

Then('I should see a confirmation for my updated bedspace', () => {
  cy.get('@room').then(room => {
    const page = Page.verifyOnPage(BedspaceShowPage, room)
    page.shouldShowBanner('Bedspace updated')

    page.shouldShowBedspaceDetails()
  })
})
