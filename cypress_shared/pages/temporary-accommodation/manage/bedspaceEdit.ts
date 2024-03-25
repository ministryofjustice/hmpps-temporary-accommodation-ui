import type { Premises, Room, UpdateRoom } from '@approved-premises/api'
import paths from '../../../../server/paths/temporary-accommodation/manage'
import LocationHeaderComponent from '../../../components/locationHeader'
import BedspaceEditablePage from './bedspaceEditable'
import { DateFormats } from '../../../../server/utils/dateUtils'

export default class BedspaceEditPage extends BedspaceEditablePage {
  private readonly locationHeaderComponent: LocationHeaderComponent

  constructor(
    premises: Premises,
    private readonly room: Room,
  ) {
    super('Edit a bedspace')

    this.locationHeaderComponent = new LocationHeaderComponent({ premises, room })
  }

  static visit(premises: Premises, room: Room): BedspaceEditPage {
    cy.visit(paths.premises.bedspaces.edit({ premisesId: premises.id, roomId: room.id }))
    return new BedspaceEditPage(premises, room)
  }

  shouldShowBedspaceDetails(): void {
    this.locationHeaderComponent.shouldShowLocationDetails()

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
    this.getTextInputByIdAndClear('name')
    cy.get('legend')
      .contains('Does the bedspace have any of the following attributes?')
      .parent()
      .within(() => {
        cy.get('label').siblings('input').uncheck()
      })

    this.getTextInputByIdAndClear('notes')
  }

  showCannotEditBedspaceEndDate(bedEndDate: string) {
    cy.get('dt').contains('Bedspace end date')
    cy.get('dd').contains(DateFormats.isoDateToUIDate(bedEndDate))
    cy.get('p').contains('The bedspace end date cannot be edited.')
    cy.get('label').contains('Enter the bedspace end date (optional)').should('not.exist')
  }
}
