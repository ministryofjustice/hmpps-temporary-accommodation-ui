import type { NewRoom } from '@approved-premises/api'
import { Premises } from '../../../../server/@types/shared'
import paths from '../../../../server/paths/temporary-accommodation/manage'
import BedspaceEditablePage from './bedspaceEditable'

export default class BedspaceNewPage extends BedspaceEditablePage {
  constructor(private readonly premises: Premises) {
    super('Add a bedspace')
  }

  static visit(premises: Premises): BedspaceNewPage {
    cy.visit(paths.premises.bedspaces.new({ premisesId: premises.id }))
    return new BedspaceNewPage(premises)
  }

  shouldShowBedspaceDetails(): void {
    cy.get('.location-header').within(() => {
      cy.get('p').should('contain', this.premises.name)
      cy.get('p').should('contain', this.premises.addressLine1)
      cy.get('p').should('contain', this.premises.postcode)
    })
  }

  completeForm(newRoom: NewRoom): void {
    this.getLabel('Enter a bedspace reference')
    this.getTextInputByIdAndEnterDetails('name', newRoom.name)

    super.completeEditableForm(newRoom)
  }
}
