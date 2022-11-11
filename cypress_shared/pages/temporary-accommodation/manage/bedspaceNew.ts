import type { NewRoom } from '@approved-premises/api'
import paths from '../../../../server/paths/temporary-accommodation/manage'
import BedspaceEditablePage from './bedspaceEditable'

export default class BedspaceNewPage extends BedspaceEditablePage {
  constructor() {
    super('Add a bedspace')
  }

  static visit(premisesId: string): BedspaceNewPage {
    cy.visit(paths.premises.bedspaces.new({ premisesId }))
    return new BedspaceNewPage()
  }

  completeForm(newRoom: NewRoom): void {
    this.getLabel('Enter a reference name')
    this.getTextInputByIdAndEnterDetails('name', newRoom.name)

    super.completeEditableForm(newRoom)
  }
}
