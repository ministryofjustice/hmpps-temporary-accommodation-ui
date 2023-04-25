import type { LostBed, Premises, Room, UpdateLostBed } from '@approved-premises/api'
import LostBedEditablePage from './lostBedEditable'
import LocationHeaderComponent from '../../../components/locationHeader'
import paths from '../../../../server/paths/temporary-accommodation/manage'

export default class LostBedEditPage extends LostBedEditablePage {
  private readonly locationHeaderComponent: LocationHeaderComponent

  constructor(premises: Premises, room: Room) {
    super('Void a bedspace', premises, room)

    this.locationHeaderComponent = new LocationHeaderComponent({ premises, room })
  }

  static visit(premises: Premises, room: Room, lostBed: LostBed): LostBedEditPage {
    cy.visit(paths.lostBeds.edit({ premisesId: premises.id, roomId: room.id, lostBedId: lostBed.id }))
    return new LostBedEditPage(premises, room)
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
