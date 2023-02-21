import type { Room, UpdateRoom } from '@approved-premises/api'
import paths from '../../../../server/paths/temporary-accommodation/manage'
import BedspaceEditablePage from './bedspaceEditable'

export default class BedspaceEditPage extends BedspaceEditablePage {
  constructor(private readonly room: Room) {
    super('Edit a bedspace')
  }

  static visit(premisesId: string, room: Room): BedspaceEditPage {
    cy.visit(paths.premises.bedspaces.edit({ premisesId, roomId: room.id }))
    return new BedspaceEditPage(room)
  }

  shouldShowBedspaceDetails(): void {
    cy.get('legend')
      .contains('Does the bedspace have any of the following attributes?')
      .parent()
      .within(() => {
        this.room.characteristics.forEach(characteristic => {
          cy.get('label').contains(characteristic.name).siblings('input').should('be.checked')
        })
      })

    cy.get('label')
      .contains('Please provide any further bedspace details')
      .siblings('textarea')
      .should('contain', this.room.notes)
  }

  completeForm(updateRoom: UpdateRoom): void {
    this.clearForm()

    super.completeEditableForm(updateRoom)
  }

  clearForm(): void {
    cy.get('legend')
      .contains('Does the bedspace have any of the following attributes?')
      .parent()
      .within(() => {
        cy.get('label').siblings('input').uncheck()
      })

    this.getTextInputByIdAndClear('notes')
  }
}
