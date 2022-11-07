import type { UpdateRoom, Room } from '@approved-premises/api'
import BedspaceEditablePage from './bedspaceEditable'

export default class BedspaceEditPage extends BedspaceEditablePage {
  constructor(private readonly room: Room) {
    super('Edit a bedspace')
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
