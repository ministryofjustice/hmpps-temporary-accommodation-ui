import type { TemporaryAccommodationLostBed as LostBed, Premises, Room, UpdateLostBed } from '@approved-premises/api'
import LostBedEditablePage from './lostBedEditable'
import LocationHeaderComponent from '../../../components/locationHeader'
import paths from '../../../../server/paths/temporary-accommodation/manage'

export default class LostBedEditPage extends LostBedEditablePage {
  private readonly locationHeaderComponent: LocationHeaderComponent

  constructor(private readonly premises: Premises, private readonly room: Room, private readonly lostBed: LostBed) {
    super('Void a bedspace')

    this.locationHeaderComponent = new LocationHeaderComponent({ premises, room })
  }

  static visit(premises: Premises, room: Room, lostBed: LostBed): LostBedEditPage {
    cy.visit(paths.lostBeds.edit({ premisesId: premises.id, roomId: room.id, lostBedId: lostBed.id }))
    return new LostBedEditPage(premises, room, lostBed)
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
