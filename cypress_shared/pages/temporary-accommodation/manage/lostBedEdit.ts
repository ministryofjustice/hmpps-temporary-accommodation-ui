import type { Cas3Bedspace, LostBed, Premises, Room, UpdateLostBed } from '@approved-premises/api'
import LostBedEditablePage from './lostBedEditable'
import LocationHeaderComponent from '../../../components/locationHeader'
import paths from '../../../../server/paths/temporary-accommodation/manage'

export default class LostBedEditPage extends LostBedEditablePage {
  private readonly locationHeaderComponent: LocationHeaderComponent

  constructor(premises: Premises, room: Room, bedspace: Cas3Bedspace) {
    super('Void a bedspace', premises, room, bedspace)

    this.locationHeaderComponent = new LocationHeaderComponent({ premises, room, bedspace })
  }

  static visit(premises: Premises, room: Room, bedspace: Cas3Bedspace, lostBed: LostBed): LostBedEditPage {
    if (room) {
      cy.visit(paths.lostBeds.edit({ premisesId: premises.id, bedspaceId: room.id, lostBedId: lostBed.id }))
    } else {
      cy.visit(paths.lostBeds.edit({ premisesId: premises.id, bedspaceId: bedspace.id, lostBedId: lostBed.id }))
    }
    return new LostBedEditPage(premises, room, bedspace)
  }

  shouldShowBedspaceDetails(): void {
    this.locationHeaderComponent.shouldShowLocationDetails()
  }

  clearForm(): void {
    super.clearDateInputs('startDate')
    super.clearDateInputs('endDate')
    super.getTextInputByIdAndClear('notes')
  }

  completeForm(updateLostBed: UpdateLostBed): void {
    super.completeEditableForm(updateLostBed)
  }
}
