import type { Cas3Bedspace, NewLostBed, Premises, Room } from '@approved-premises/api'
import paths from '../../../../server/paths/temporary-accommodation/manage'
import LocationHeaderComponent from '../../../components/locationHeader'
import LostBedEditablePage from './lostBedEditable'

export default class LostBedNewPage extends LostBedEditablePage {
  private readonly locationHeaderComponent: LocationHeaderComponent

  constructor(premises: Premises, room: Room, bedspace: Cas3Bedspace) {
    super('Void a bedspace', premises, room, bedspace)

    this.locationHeaderComponent = new LocationHeaderComponent({ premises, room, bedspace })
  }

  static visit(premises: Premises, room: Room, bedspace: Cas3Bedspace): LostBedNewPage {
    if (room) {
      cy.visit(paths.lostBeds.new({ premisesId: premises.id, bedspaceId: room.id }))
    } else {
      cy.visit(paths.lostBeds.new({ premisesId: premises.id, bedspaceId: bedspace.id }))
    }
    return new LostBedNewPage(premises, room, bedspace)
  }

  shouldShowBedspaceDetails(): void {
    this.locationHeaderComponent.shouldShowLocationDetails(true)
  }

  completeForm(newLostBed: NewLostBed): void {
    super.completeEditableForm(newLostBed)
  }
}
