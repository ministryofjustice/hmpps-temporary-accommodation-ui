import { Given, Then } from '@badeball/cypress-cucumber-preprocessor'
import roomFactory from '../../../../server/testutils/factories/room'
import newRoomFactory from '../../../../server/testutils/factories/newRoom'
import updateRoomFactory from '../../../../server/testutils/factories/updateRoom'
import characteristicFactory from '../../../../server/testutils/factories/characteristic'
import BedspaceNewPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bedspaceNew'
import PremisesShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/premisesShow'
import PremisesListPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/premisesList'
import BedspaceEditPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bedspaceEdit'

Given("I'm creating a bedspace", () => {
  cy.get('@premises').then(premises => {
    const page = PremisesShowPage.verifyOnPage(PremisesShowPage, premises)
    page.clickAddBedspaceLink()
  })
})

Given('I create a bedspace with all necessary details', () => {
  const page = BedspaceNewPage.verifyOnPage(BedspaceNewPage)

  page.getCharacteristicIdByLabel('Not suitable for arson offenders', 'arsonCharacteristicId')
  page.getCharacteristicIdByLabel('School nearby', 'schooNearbyCharacteristicId')

  cy.then(function _() {
    const { arsonCharacteristicId } = this
    const { schooNearbyCharacteristicId } = this

    const newRoom = newRoomFactory.build({
      characteristicIds: [arsonCharacteristicId, schooNearbyCharacteristicId],
    })

    const room = roomFactory.build({
      id: 'unknown',
      ...newRoom,
      characteristics: [
        characteristicFactory.build({
          name: 'Not suitable for arson offenders',
          id: arsonCharacteristicId,
        }),
        characteristicFactory.build({
          name: 'School nearby',
          id: schooNearbyCharacteristicId,
        }),
      ],
    })

    cy.wrap(room).as('room')
    page.completeForm(newRoom)
  })
})

Given("I'm editing the bedspace", () => {
  const premisesListPage = PremisesListPage.visit()

  cy.then(function _() {
    premisesListPage.clickPremisesViewLink(this.premises)

    const premisesShowPage = PremisesShowPage.verifyOnPage(PremisesShowPage, this.premises)
    premisesShowPage.clickBedpaceEditLink(this.room)
  })
})

Given('I edit the bedspace details', () => {
  cy.get('@room').then(room => {
    const page = BedspaceEditPage.verifyOnPage(BedspaceEditPage, room)

    page.getCharacteristicIdByLabel('Park nearby', 'parkNearbyCharacteristicId')
    page.getCharacteristicIdByLabel('Floor level access', 'floorLevelAccessCharacteristicId')

    cy.then(function _() {
      const { parkNearbyCharacteristicId } = this
      const { floorLevelAccessCharacteristicId } = this

      const updateRoom = updateRoomFactory.build({
        characteristicIds: [parkNearbyCharacteristicId, floorLevelAccessCharacteristicId],
      })

      const updatedPremises = roomFactory.build({
        ...room,
        ...updateRoom,
        characteristics: [
          characteristicFactory.build({
            name: 'Park nearby',
            id: parkNearbyCharacteristicId,
          }),
          characteristicFactory.build({
            name: 'Floor level access',
            id: floorLevelAccessCharacteristicId,
          }),
        ],
      })

      cy.wrap(updatedPremises).as('room')
      page.completeForm(updateRoom)
    })
  })
})

Then('I should see a confirmation for my new bedspace', () => {
  cy.then(function _() {
    const page = PremisesShowPage.verifyOnPage(PremisesShowPage, this.premises)
    page.shouldShowBanner('Bedspace created')

    page.shouldShowRoomDetails(this.room)
  })
})

Then('I should see a confirmation for my updated bedspace', () => {
  cy.then(function _() {
    const page = PremisesShowPage.verifyOnPage(PremisesShowPage, this.premises)
    page.shouldShowBanner('Bedspace updated')

    page.shouldShowRoomDetails(this.room)
  })
})
